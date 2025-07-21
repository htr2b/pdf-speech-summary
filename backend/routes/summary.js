// routes/summary.js
import { Router } from 'express'
import fs from 'fs/promises'
import path from 'path'
import { CohereClientV2 } from 'cohere-ai'
import nlp from 'compromise'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

// 1) Cohere istemcisini API key ile başlatın
const cohere = new CohereClientV2({
    apiKey: process.env.COHERE_API_KEY
})

// 2) Dosya yollarınızı sabitleyin
const INPUT_FILE = path.join(process.cwd(), 'input.txt')
const PROMPT_FILE = path.join(process.cwd(), 'prompt.txt')
const OUTPUT_FILE = path.join(process.cwd(), 'output.txt')

// 3) Metni cümlelere bölüp parçalara ayıracak yardımcı
function chunkText(sentences, maxWords) {
    const chunks = []
    let current = [], count = 0

    for (const s of sentences) {
        const w = s.split(' ').length
        if (count + w > maxWords) {
            chunks.push(current.join(' '))
            current = [s]
            count = w
        } else {
            current.push(s)
            count += w
        }
    }
    if (current.length) chunks.push(current.join(' '))
    return chunks
}

// 4) GET /summary → en güncel input.txt’i oku , özetle, hem JSON dön hem de output.txt’e yaz
router.get('/', async (req, res, next) => {
    try {
        // 4.1) input ve prompt’u her istekte okuyun
        const [inputText, prompt] = await Promise.all([
            fs.readFile(INPUT_FILE, 'utf8'),
            fs.readFile(PROMPT_FILE, 'utf8')
        ])

        if (!inputText.trim()) {
            return res
                .status(400)
                .json({ status: 'error', message: 'input.txt boş.' })
        }

        // 4.2) cümlelere böl ve 100 kelimelik parçalara ayır
        const sentences = nlp(inputText).sentences().out('array')
        const chunks = chunkText(sentences, 100)

        // 4.3) Cohere chat çağrısı
        const response = await cohere.chat({
            model: 'command-a-03-2025',
            messages: [{
                role: 'user',
                content: prompt + "\n\n" + chunks.join("\n\n")
            }]
        })

        // 4.4) API yanıtından özet metnini çek
        // CohereClientV2 chat API'sı, choices dizisi yerine message.content içinde de olabilir:
        const summaryText = (
            response.choices?.[0]?.message?.content
            || response.message?.content?.[0]?.text
            || ''
        ).trim()

        // 4.5) Özet metnini output.txt’e yaz (tek satıra sıkıştırılmış)
        const normalized = summaryText
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        await fs.writeFile(OUTPUT_FILE, normalized, 'utf8')

        // 4.6) İstemciye JSON ile dönün
        res.json({ status: 'success', summary: summaryText })

    } catch (err) {
        console.error('Summary route error:', err)
        next(err)
    }
})

export default router

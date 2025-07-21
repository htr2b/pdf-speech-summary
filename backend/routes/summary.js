// routes/summary.js
import { Router } from 'express'
import fs from 'fs/promises'
import path from 'path'
import { CohereClientV2 } from 'cohere-ai'
import nlp from 'compromise'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

const cohere = new CohereClientV2({
    apiKey: process.env.COHERE_API_KEY
})

const INPUT_FILE = path.join(process.cwd(), 'input.txt')
const PROMPT_FILE = path.join(process.cwd(), 'prompt.txt')
const OUTPUT_FILE = path.join(process.cwd(), 'output.txt')

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

router.get('/', async (req, res, next) => {
    try {
        const [inputText, prompt] = await Promise.all([
            fs.readFile(INPUT_FILE, 'utf8'),
            fs.readFile(PROMPT_FILE, 'utf8')
        ])

        if (!inputText.trim()) {
            return res
                .status(400)
                .json({ status: 'error', message: 'input.txt boş.' })
        }

        const sentences = nlp(inputText).sentences().out('array')
        const chunks = chunkText(sentences, 100)

        const response = await cohere.summarize({
            model: 'command-a-03-2025',
            messages: [{
                role: 'user',
                text: chunks.join(" ")
            }]
        })

        const summaryText = (
            response.choices?.[0]?.message?.content
            || response.message?.content?.[0]?.text
            || ''
        ).trim()

        const normalized = summaryText
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        await fs.writeFile(OUTPUT_FILE, normalized, 'utf8')

        res.json({ status: 'success', summary: summaryText })

    } catch (err) {
        console.error('Summary route error:', err)
        next(err)
    }
})

export default router

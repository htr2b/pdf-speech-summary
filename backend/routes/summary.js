// import Gemini from "gemini-ai" 
// import OpenAI from "openai"

import { CohereClientV2 } from "cohere-ai"
import nlp from "compromise"
import dotenv from "dotenv"
import fs from 'fs'
import path from 'path'
dotenv.config()
import express from "express"




// const gemini = new Gemini(process.env.API_KEY) 
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const input = fs.readFileSync(path.join(process.cwd(), 'input.txt'), 'utf-8')
const summary = express.Router()
const prompt = fs.readFileSync(path.join(process.cwd(), 'prompt.txt'), 'utf-8')

const cohere = new CohereClientV2({
})

function chunkText(sentences, maxWord) {
    const chunks = []
    let currentChunk = []
    let currentWordCount = 0
    for (const sentence of sentences) {
        const words = sentence.split(' ').length
        if (currentWordCount + words > maxWord) {
            chunks.push(currentChunk.join(' '))
            currentChunk = [sentence]
            currentWordCount = words
        } else {
            currentChunk.push(sentence)
            currentWordCount += words
        }
    }
    if (currentChunk.length) {
        chunks.push(currentChunk.join(' '))
    }
    return chunks
}
const sentences = nlp(input).sentences().out('array')
const chunks = chunkText(sentences, 100)

summary.get("/", async (req, res) => {
    try {
        const response = await cohere.chat({
            model: 'command-a-03-2025',
            messages: [
                {
                    role: 'user',
                    content: prompt + "\n" + chunks.join("\n"),
                },
            ],
        })
        let summaryText = response.message.content[0].text
        summaryText = summaryText.replace(/[\n\r]/g, '\n').replace(/\*\*/g, '')
        res.send(`<div style="font-family:inherit;font-size:1rem;word-break:break-all;white-space:pre-line;">${summaryText}</div>`)
        summaryText = summaryText
            .replace(/<br>/g, ' ')
            .replace(/[\n\r]/g, ' ')
            .replace(/\*\*/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        writeSummarytoFile(summaryText)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "OpenAI API error" })
    }
})
const outputFile = path.join(process.cwd(), 'output.txt')


function writeSummarytoFile(summaryText) {
    if (!summaryText) {
        console.error("No summary text provided")
        return
    }
    fs.writeFile(outputFile, summaryText, 'utf-8', (err) => {
        if (err) {
            console.error("Error writing to file:", err)
        }
    })
}
// summary.get("/", async (req, res) => {
//     try {
//         const response = await client.chat.completions.create({
//             model: "gpt-4o",
//             messages: [
//                 { role: "system", content: prompt },
//                 { role: "user", content: input }
//             ]
//         })
//         const summaryText = response.choices[0].message.content
//         res.json({ summary: summaryText })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ error: "OpenAI API error" })
//     }
// })

// summary.get("/", async (req, res) => {
//     try {
//         const response = await gemini.ask(input, prompt, {
//             model: "gemini-1.5-flash",
//             stream: console.log
//         })
//         res.send(response)
//     } catch (error) {
//         res.status(500).json({ error: "Gemini API error" })
//     }
// })



export default summary

// import Gemini from "gemini-ai" 
// import OpenAI from "openai"

import { CohereClientV2 } from "cohere-ai"

import dotenv from "dotenv"
import fs from 'fs'
import path from 'path'
dotenv.config()
import express from "express"


const input = fs.readFileSync(path.join(process.cwd(), 'input.txt'), 'utf-8')


// const gemini = new Gemini(process.env.API_KEY) 
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const summary = express.Router()
const prompt = fs.readFileSync(path.join(process.cwd(), 'prompt.txt'), 'utf-8')

const cohere = new CohereClientV2({
})

summary.get("/", async (req, res) => {
    try {
        const response = await cohere.chat({
            model: 'command-a-03-2025',
            messages: [
                {
                    role: 'user',
                    content: prompt + input,
                },
            ],
        })
        const summaryText = JSON.stringify(response.message.content[0].text)
        res.send(summaryText)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "OpenAI API error" })
    }
})

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

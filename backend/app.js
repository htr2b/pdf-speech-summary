import express from 'express'
import config from 'dotenv'
import summaryRouter from './routes/summary.js'
import speechRoutes from './routes/speech.js'
import ttsRouter from './routes/tts.js'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())
app.use('/', ttsRouter)
app.use(express.json())
app.use('/speech', speechRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/speech/summary', summaryRouter)
app.use(express.static(path.join(__dirname, '../public')))


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


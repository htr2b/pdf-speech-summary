import express from 'express'
const router = express.Router()
import upload from '../utils/multerconfig.js'
import transcribeSpeech from '../utils/google-speech.js'
import uploadToCloudStorage from '../utils/cloud-storage.js'
import fs from 'fs'
import path from 'path'


const inputFile = path.join(process.cwd(), 'input.txt')

router.post('/upload', upload.single('audio'), async (req, res) => {

    try {
        const localPath = req.file.path
        const fileName = req.file.filename

        const gcsUri = await uploadToCloudStorage(localPath, fileName)
        const transcript = await transcribeSpeech(gcsUri)
        fs.unlinkSync(localPath)

        console.log(transcript)
        res.status(200).json({
            gcsUri,
            transcript
        })

        fs.writeFileSync(inputFile, transcript, 'utf-8')
        console.log("input.txt oluşturuldu!")


    } catch (error) {
        console.error('TRANSCRIBE ERROR:', error)
        res.status(500).json({
            error: 'Transcription failed'
        })

    }
})


export default router
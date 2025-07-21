// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import textToSpeech from '@google-cloud/text-to-speech';
// import fs from 'fs';
// import util from 'util';
// import path from 'path';

// const router = express.Router();
// const client = new textToSpeech.TextToSpeechClient();

// router.post('/tts', async (req, res) => {
//     const { summary } = req.body;

//     if (!summary) {
//         return res.status(400).json({ error: 'Summary text is missing.'})
//     }

//     const request = {
//         input: { text: summary},
//         voice: { languageCode: 'tr-TR', ssmlGender: 'FEMALE'},
//         audioConfig: { audioEncoding: 'MP3'},
//     };

//     try {
//         const [response] = await client.synthesizeSpeech(request);

//         const fileName = `summary_${Date.now()}.mp3`;
//         const filePath = path.join('uploads', fileName);

//         await util.promisify(fs.writeFile)(filePath, response.audioContent, 'binary');

//         // res.sendFile(path.resolve(filePath));
//         res.json({ url: `/uploads/${fileName}` });
//     } catch (error) {
//         console.error('TTS Error:', error);
//         res.status(500).json({error: 'Failed to synthesize speech'});
//     }

// })

// export default router;


import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import fs from 'fs'
import util from 'util'
import path from 'path'
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}
const router = express.Router()
const client = new TextToSpeechClient({
  keyFilename: path.resolve('credentials/tts-key.json')
})
router.post('/tts', async (req, res) => {
  const { summary } = req.body

  if (!summary) {
    return res.status(400).json({ error: 'Summary text is missing.' })
  }
  if (typeof summary !== 'string' || summary.length > 2000) {
    return res.status(400).json({ error: 'Summary çok uzun veya geçersiz.' })
  }
  const request = {
    input: { text: summary },
    voice: { languageCode: 'tr-TR', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' },
  }

  try {
    const [response] = await client.synthesizeSpeech(request)

    const fileName = `summary_${Date.now()}.mp3`
    const filePath = path.join('uploads', fileName)

    await util.promisify(fs.writeFile)(filePath, response.audioContent, 'binary')

    // ÖNEMLİ: sadece URL gönderiyoruz
    res.json({ url: `/uploads/${fileName}` })
    //res.json({ url: path.join('uploads/', fileName) })

  } catch (error) {
    console.error('TTS Error:', error)
    res.status(500).json({ error: error.message || 'Unknown TTS error' })
  }
})

export default router

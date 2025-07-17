import express from 'express'
const app = express()
import cors from 'cors'
import summaryRouter from './routes/summary.js'
app.use(cors())


app.get('/', (req, res) => {
    res.send('Welcome to the API')
})


app.use('/summary', summaryRouter)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
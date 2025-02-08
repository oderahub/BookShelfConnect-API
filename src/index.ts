import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'QuikDb capstone project' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

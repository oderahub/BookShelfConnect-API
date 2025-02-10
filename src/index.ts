import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { quikdb, initOwner } from './config/db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
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

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'QuikDb Capstone Project' })
})

// Initialize QuikDB and Start Server
const startServer = async () => {
  try {
    await quikdb.init()
    await initOwner()
    console.log('QuikDB Initialized Successfully')

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('❌ Error initializing QuikDB:', error)
    process.exit(1) // Exit if QuikDB fails to initialize
  }
}

// Start the server
startServer()

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Database } from './config/db'

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
    console.log('🚀 Initializing QuikDB...')
    const dbInstance = await Database.getInstance()

    await Database.initOwner() // Ensure the owner is set

    console.log('✅ QuikDB Initialized Successfully')

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`)
    })

    // Graceful Shutdown
    const shutdown = () => {
      console.log('🛑 Shutting down server...')
      server.close(() => {
        console.log('✅ Server closed. Cleaning up resources...')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    console.error('❌ Error initializing QuikDB:', error)
    process.exit(1) // Exit if QuikDB fails to initialize
  }
}

// Start the server
startServer()

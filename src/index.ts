import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Database } from './config/db'
import helmet from 'helmet'
import 'express-async-errors'
import userRoutes from './routes/user.routes'
import bookRoutes from './routes/book.routes'
import { setupDatabase } from './utils/helper'
import { globalUserContext } from './middleware/auth.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Security headers
app.use(helmet())
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

// Parse JSON bodies
app.use(express.json())

app.disable('x-powered-by')

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'QuikDb Capstone Project' })
})

// Routes
app.use('/api/v1/auth/users', userRoutes)
app.use('/api/v1/books', bookRoutes) // This will now use auth middleware

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ success: false, error: 'Internal Server Error' })
})

// Initialize QuikDB and Start Server
const startServer = async () => {
  try {
    console.log('🚀 Initializing QuikDB...')

    const instance = await Database.getInstance()
    await instance.init()

    await Database.initOwner(instance)

    console.log('✅ QuikDB Initialized Successfully')

    // Pass the global user context to setupDatabase
    await setupDatabase({ defineSchema: true })

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
    process.exit(1)
  }
}

startServer()

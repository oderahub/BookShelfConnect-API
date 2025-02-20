import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Database } from './config/db'
import helmet from 'helmet'
import 'express-async-errors'
import userRoutes from './routes/user.routes'
import bookRoutes from './routes/book.routes'
import { setupDatabase } from './utils/helper'
import { rateLimiter } from './middleware/rateLimiter'
import { logger } from './utils/logger'
import { Server } from 'http'
import { setupSwagger } from './config/swagger' // Import from swagger.ts

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

// Rate Limiter
app.use(rateLimiter)

setupSwagger(app)

// Routes
app.use('/api/v1/auth/users', userRoutes)
app.use('/api/v1/books', bookRoutes) // This will now use auth middleware

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack)
  res.status(500).json({ success: false, error: 'Internal Server Error' })
})

// Initialize QuikDB and Start Server
const startServer = async () => {
  try {
    logger.info('🚀 Initializing QuikDB...')

    const instance = await Database.getInstance()
    await instance.init()

    await Database.initOwner(instance)

    logger.info('✅ QuikDB Initialized Successfully')

    // Pass the global user context to setupDatabase
    await setupDatabase({ defineSchema: true })

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`)
    })

    // Graceful Shutdown
    const shutdown = () => {
      logger.info('🛑 Shutting down server...')
      server.close(() => {
        logger.info('✅ Server closed. Cleaning up resources...')
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('❌ Error initializing QuikDB:', error)
    process.exit(1)
  }
}

startServer()

// import express from 'express'
// import cors from 'cors'
// import dotenv from 'dotenv'
// import { Database } from './config/db'
// import helmet from 'helmet'
// import 'express-async-errors'
// import userRoutes from './routes/user.routes'
// import bookRoutes from './routes/book.routes'
// import { setupDatabase } from './utils/helper'
// import { rateLimiter } from './middleware/rateLimiter'
// import { logger } from './utils/logger'
// import { Server } from 'http'
// import { setupSwagger } from './config/swagger' // Import from swagger.ts

// dotenv.config()

// const PORT = process.env.PORT || 3000

// export const initializeApp = () => {
//   const app = express()

//   // Security headers
//   app.use(helmet())
//   app.use(
//     cors({
//       origin: '*',
//       methods: ['GET', 'POST', 'PUT', 'DELETE'],
//       allowedHeaders: ['Content-Type', 'Authorization'],
//       credentials: true
//     })
//   )

//   // Parse JSON bodies
//   app.use(express.json())
//   app.disable('x-powered-by')

//   // Health Check Route
//   app.get('/', (req, res) => {
//     res.json({ message: 'QuikDb Capstone Project' })
//   })

//   // Rate Limiter
//   app.use(rateLimiter)

//   // Add OpenAPI documentation
//   //setupSwagger(app) // Use the setupSwagger function

//   // Routes
//   app.use('/api/v1/auth/users', userRoutes)
//   app.use('/api/v1/books', bookRoutes)

//   // 404 handler
//   app.use((req, res) => {
//     res.status(404).json({ success: false, error: 'Not Found' })
//   })

//   // Error handling middleware
//   app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     logger.error(err.stack)
//     res.status(500).json({ success: false, error: 'Internal Server Error' })
//   })

//   return app
// }

// export const initializeDatabase = async () => {
//   logger.info('🚀 Initializing QuikDB...')
//   const instance = await Database.getInstance()
//   await Database.initOwner(instance)
//   logger.info('✅ QuikDB Initialized Successfully')
//   await setupDatabase({ defineSchema: true })
// }

// export const createServer = async (): Promise<express.Application> => {
//   try {
//     await initializeDatabase()
//     const app = initializeApp()
//     return app
//   } catch (error) {
//     logger.error('❌ Error initializing QuikDB:', error)
//     throw error // Throw instead of exit for better testing
//   }
// }

// export const startServer = async (): Promise<Server> => {
//   const app = await createServer()
//   const server = app.listen(PORT, () => {
//     logger.info(`🚀 Server is running on port ${PORT}`)
//   })

//   const shutdown = () => {
//     logger.info('🛑 Shutting down server...')
//     server.close(() => {
//       logger.info('✅ Server closed. Cleaning up resources...')
//       process.exit(0)
//     })
//   }

//   process.on('SIGINT', shutdown)
//   process.on('SIGTERM', shutdown)

//   return server
// }

// // Only start the server if this file is being run directly
// if (require.main === module) {
//   startServer().catch((error) => {
//     logger.error('Failed to start server:', error)
//     process.exit(1)
//   })
// }

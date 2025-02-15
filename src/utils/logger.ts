import { createLogger, format, transports } from 'winston'

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(
    ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
  )
)

// Create Winston logger
export const logger = createLogger({
  level: 'info', // Log level (error, warn, info, debug)
  format: logFormat,
  transports: [
    new transports.Console(), // Logs to the console
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to file
    new transports.File({ filename: 'logs/combined.log' }) // Log all messages to file
  ]
})

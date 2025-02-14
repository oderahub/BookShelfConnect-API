import { Request } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    validatedData?: any // Temporarily use 'any' to avoid import issues
  }
}

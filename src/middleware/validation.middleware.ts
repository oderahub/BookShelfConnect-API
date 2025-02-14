// validation.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { sendError } from '../constants/error'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Determine whether to validate req.body or req.query based on the request method
    const data = req.method === 'GET' ? req.query : req.body

    // Parse query parameters explicitly for GET requests to match schema structure
    const parsedData =
      req.method === 'GET'
        ? {
            title: req.query.title || undefined,
            author: req.query.author || undefined,
            isbn: req.query.isbn || undefined
          }
        : data

    const result = schema.safeParse(parsedData)

    if (!result.success) {
      return sendError(
        res,
        {
          message: 'Validation failed',
          details: result.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        400
      )
    }

    // Attach validated data to the request
    req.validatedData = result.data
    next()
  }
}

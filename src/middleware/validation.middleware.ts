import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { sendError } from '../constants/error'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

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

    next()
  }
}

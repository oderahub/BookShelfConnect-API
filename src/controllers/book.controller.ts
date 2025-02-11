import { Request, Response } from 'express'
import { BookService } from '../services/book.service'
import { BaseController } from './base.controller'
import { Book } from '../types'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendError } from '../constants/error'

export class BookController extends BaseController<Book> {
  constructor() {
    super(new BookService())
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'Unauthorized: User ID is missing', 401)
      }

      const bookData = {
        ...req.body,
        ownerId: req.user.userId,
        averageRating: 0,
        reviewCount: 0
      }

      const result = await this.service.create(bookData)
      if (result.success) {
        res.status(201).json(result)
      } else {
        sendError(res, result.error ?? 'Book creation failed', 400)
      }
    } catch (error) {
      console.error('❌ Error in create:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  async searchByTitle(req: Request, res: Response): Promise<void> {
    try {
      const title = req.query.title as string
      if (!title) {
        return sendError(res, 'Title is required', 400)
      }

      const result = await (this.service as BookService).findByTitle(title)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, 'No books found', 404)
      }
    } catch (error) {
      console.error('❌ Error in searchByTitle:', error)
      sendError(res, 'Internal server error', 500)
    }
  }
}

import { Request, Response } from 'express'
import { BookService } from '../services/book.service'
import { BaseController } from './base.controller'
import { Book } from '../types'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendError } from '../constants/error'
import { logger } from '../utils/logger'
import { ReviewService } from '../services/review.service'

export class BookController extends BaseController<Book> {
  private reviewService: ReviewService

  constructor() {
    super(new BookService())
    this.reviewService = new ReviewService()
  }

  /**
   * @openapi
   * /books:
   *   post:
   *     summary: Create a new book
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Book'
   *     responses:
   *       201:
   *         description: Book created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { $ref: '#/components/schemas/Book' }
   *                 message: { type: 'string' }
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'Unauthorized: User ID is missing', 401)
      }

      const bookData = {
        ...req.body,
        ownerId: req.user.userId
      }

      const result = await this.service.create(bookData)
      if (result.success) {
        res.status(201).json(result)
      } else {
        sendError(res, result.error ?? 'Book creation failed', 400)
      }
    } catch (error) {
      logger.error('❌ Error in create:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  /**
   * @openapi
   * /books/search:
   *   get:
   *     summary: Search books by title
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: title
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Books found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { type: 'array', items: { $ref: '#/components/schemas/Book' } }
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: No books found
   *       500:
   *         description: Internal server error
   */

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
      logger.error('❌ Error in searchByTitle:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  /**
   * @openapi
   * /books/{id}/reviews:
   *   post:
   *     summary: Add a review for a book
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rating: { type: 'number', minimum: 1, maximum: 5 }
   *               comment: { type: 'string' }
   *             required: ['rating']
   *     responses:
   *       201:
   *         description: Review added successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async addReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'Unauthorized: User ID is missing', 401)
      }

      const bookId = req.params.id
      const { rating, comment } = req.body

      const reviewData = {
        bookId,
        userId: req.user.userId,
        rating,
        comment
      }

      const result = await this.reviewService.createReview(reviewData)
      if (result.success) {
        res.status(201).json(result)
      } else {
        sendError(res, result.error ?? 'Review creation failed', 400)
      }
    } catch (error) {
      logger.error('❌ Error in addReview:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  /**
   * @openapi
   * /books/{id}/reviews:
   *   get:
   *     summary: Get all reviews for a book
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Reviews retrieved successfully
   *       404:
   *         description: No reviews found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const bookId = req.params.id
      const result = await this.reviewService.findReviewsByBookId(bookId)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, 'No reviews found', 404)
      }
    } catch (error) {
      logger.error('❌ Error in getReviews:', error)
      sendError(res, 'Internal server error', 500)
    }
  }
}

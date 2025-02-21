// services/review.service.ts
import { ReviewModel } from '../models/review.model'
import { BookModel } from '../models/book.model'
import { BaseService } from './base.service'
import { ApiResponse } from '../utils/response'
import { logger } from '../utils/logger'
import { Review } from '../types'

export class ReviewService extends BaseService<Review> {
  private bookModel: BookModel

  constructor() {
    super(new ReviewModel())
    this.bookModel = new BookModel()
  }

  async createReview(
    reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Review>> {
    try {
      const { bookId, rating } = reviewData
      if (rating < 1 || rating > 5) {
        return ApiResponse.error('Rating must be between 1 and 5')
      }

      const result = await this.create({
        ...reviewData,
        createdAt: new Date().toString(),
        updatedAt: new Date().toString()
      })

      if (result.success && result.data) {
        // Update book's average rating and review count
        await this.bookModel.updateRatingStats(bookId, rating)
        return ApiResponse.success(result.data, 'Review created successfully')
      }

      return ApiResponse.error('Review creation failed')
    } catch (error) {
      logger.error('❌ Service error during createReview:', error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async findReviewsByBookId(bookId: string): Promise<ApiResponse<Review[]>> {
    try {
      const result = await (this.model as ReviewModel).findByBookId(bookId)

      if ('ok' in result && Array.isArray(result.ok) && result.ok.length > 0) {
        return ApiResponse.success(result.ok as unknown as Review[], 'Reviews found')
      }

      return ApiResponse.error('No reviews found')
    } catch (error) {
      logger.error('❌ Service error during findReviewsByBookId:', error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

import { BookModel } from '../models/book.model'
import { BaseService } from './base.service'
import { Book } from '../types'
import { ApiResponse } from '../utils/response'

export class BookService extends BaseService<Book> {
  constructor() {
    super(new BookModel())
  }

  async findByTitle(title: string): Promise<ApiResponse<Book[]>> {
    try {
      const result = await (this.model as BookModel).findByTitle(title)

      if ('ok' in result && Array.isArray(result.ok) && result.ok.length > 0) {
        return ApiResponse.success(result.ok as unknown as Book[], 'Books found')
      }

      return ApiResponse.error('No books found')
    } catch (error) {
      console.error('❌ Service error during findByTitle:', error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async updateRating(bookId: string, rating: number): Promise<ApiResponse<boolean>> {
    try {
      const book = await this.findById(bookId)

      if (!book.success || !book.data) {
        return ApiResponse.error('Book not found')
      }

      // Ensure `averageRating` and `reviewCount` exist
      const currentReviewCount = book.data.reviewCount ?? 0
      const currentAverageRating = book.data.averageRating ?? 0

      const newReviewCount = currentReviewCount + 1
      const newAverageRating = (currentAverageRating * currentReviewCount + rating) / newReviewCount

      const updateResult = await this.update(bookId, {
        averageRating: newAverageRating,
        reviewCount: newReviewCount
      })

      return updateResult
    } catch (error) {
      console.error('❌ Service error during updateRating:', error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

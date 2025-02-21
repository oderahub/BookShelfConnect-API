import { Book } from '../types'
import { CanisterMethod, ResultBool, ResultRecords } from 'quikdb-cli-beta/v1/sdk'
import { BaseModel } from './base.model'
import { logger } from '../utils/logger'

export class BookModel extends BaseModel<Book> {
  protected schemaName = 'BookSchema'

  public async defineSchema(): Promise<void> {
    await super.defineSchema()

    try {
      const existingSchemas = await this.db.callCanisterMethod<string[]>(
        CanisterMethod.ListSchemas,
        []
      )

      if (
        'ok' in existingSchemas &&
        Array.isArray(existingSchemas.ok) &&
        existingSchemas.ok.includes(this.schemaName)
      ) {
        logger.info('✅ Schema already exists, skipping creation')
        return
      }

      const fields = [
        { name: 'title', fieldType: 'Text', required: true, unique: false },
        { name: 'author', fieldType: 'Text', required: true, unique: false },
        { name: 'isbn', fieldType: 'Text', required: false, unique: true },
        { name: 'description', fieldType: 'Text', required: true, unique: false },
        { name: 'ownerId', fieldType: 'Text', required: true, unique: false },
        { name: 'averageRating', fieldType: 'Int', required: false, unique: false },
        { name: 'reviewCount', fieldType: 'Int', required: false, unique: false },
        { name: 'createdAt', fieldType: 'Text', required: true, unique: false },
        { name: 'updatedAt', fieldType: 'Text', required: true, unique: false }
      ]

      const indexes = ['title', 'author']
      const args: [string, typeof fields, string[]] = [this.schemaName, fields, indexes]

      const result = await this.db.callCanisterMethod<ResultBool>(CanisterMethod.CreateSchema, args)

      // if ('err' in result) {
      //   throw new Error(`Failed to create schema: ${result.err}`)
      // }

      logger.info('✅ Schema defined successfully')
    } catch (error) {
      logger.error('❌ Failed to define schema:', error)
      throw error
    }
  }

  async findByOwnerId(ownerId: string): Promise<ResultRecords> {
    return this.search('ownerId', ownerId)
  }

  async findByTitle(title: string): Promise<ResultRecords> {
    return this.search('title', title)
  }

  async findByAuthor(author: string): Promise<ResultRecords> {
    return this.search('author', author)
  }

  async updateRatingStats(
    bookId: string,
    newRating: number,
    reviewCountIncrement: number = 1
  ): Promise<ResultBool> {
    try {
      const bookResult = await this.findById(bookId)
      if ('err' in bookResult || !bookResult.ok.length) {
        throw new Error('Book not found')
      }

      const book = bookResult.ok[0]
      const currentRating = Number(book.fields.find(([key]) => key === 'averageRating')?.[1]) || 0
      const currentCount = Number(book.fields.find(([key]) => key === 'reviewCount')?.[1]) || 0

      const updatedCount = currentCount + reviewCountIncrement
      const updatedRating = (currentRating * currentCount + newRating) / updatedCount

      const updateData = {
        averageRating: updatedRating,
        reviewCount: updatedCount,
        updatedAt: new Date().toString()
      }

      return await this.update(bookId, updateData)
    } catch (error) {
      logger.error(`❌ Error updating rating stats for book ${bookId}:`, error)
      throw error
    }
  }
}

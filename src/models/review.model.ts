// models/review.model.ts
import { CanisterMethod, ResultBool, ResultRecords } from 'quikdb-cli-beta/v1/sdk'
import { BaseModel } from './base.model'
import { logger } from '../utils/logger'
import { Review } from '../types'

export class ReviewModel extends BaseModel<Review> {
  protected schemaName = 'ReviewSchema'

  public async defineSchema(): Promise<void> {
    await super.defineSchema()

    try {
      const existingSchemas = await this.db.callCanisterMethod<string[]>(
        CanisterMethod.ListSchemas,
        []
      )

      if ('ok' in existingSchemas && existingSchemas.includes(this.schemaName)) {
        logger.info('✅ ReviewSchema already exists, skipping creation')
        return
      }

      const fields = [
        { name: 'bookId', fieldType: 'Text', required: true, unique: false },
        { name: 'userId', fieldType: 'Text', required: true, unique: false },
        { name: 'rating', fieldType: 'Int', required: true, unique: false },
        { name: 'comment', fieldType: 'Text', required: false, unique: false },
        { name: 'createdAt', fieldType: 'Text', required: true, unique: false },
        { name: 'updatedAt', fieldType: 'Text', required: true, unique: false }
      ]

      const indexes = ['bookId', 'userId'] // Index for faster queries
      const args: [string, typeof fields, string[]] = [this.schemaName, fields, indexes]

      const result = await this.db.callCanisterMethod<ResultBool>(CanisterMethod.CreateSchema, args)
      logger.info('✅ ReviewSchema defined successfully')
    } catch (error) {
      logger.error('❌ Failed to define ReviewSchema:', error)
      throw error
    }
  }

  async findByBookId(bookId: string): Promise<ResultRecords> {
    return this.search('bookId', bookId)
  }

  async findByUserId(userId: string): Promise<ResultRecords> {
    return this.search('userId', userId)
  }
}

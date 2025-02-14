import { Book } from '../types'
import { CanisterMethod, ResultBool, ResultRecords } from 'quikdb-cli-beta/v1/sdk'
import { BaseModel } from './base.model'

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
        console.log('✅ Schema already exists, skipping creation')
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

      console.log('✅ Schema defined successfully')
    } catch (error) {
      console.error('❌ Failed to define schema:', error)
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
}

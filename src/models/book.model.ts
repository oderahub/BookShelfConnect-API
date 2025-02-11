import { BaseModel } from './base.model'
import { Book } from '../types'
import { CanisterMethod, ResultBool } from 'quikdb-cli-beta/v1/sdk'

export class BookModel extends BaseModel<Book> {
  protected schemaName = 'BookSchema'

  protected async defineSchema(): Promise<void> {
    const schema = [
      {
        name: 'BookSchema',
        fields: [
          { name: 'title', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'author', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'isbn', type: 'string', fieldType: 'Text', required: true, unique: true },
          { name: 'description', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'ownerId', type: 'string', fieldType: 'Text', required: true, unique: false },
          {
            name: 'averageRating',
            type: 'float',
            fieldType: 'Float',
            required: true,
            unique: false
          },
          { name: 'reviewCount', type: 'int', fieldType: 'Int', required: true, unique: false },
          { name: 'createdAt', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'updatedAt', type: 'string', fieldType: 'Text', required: true, unique: false }
        ],
        indexes: ['isbn', 'title', 'author']
      }
    ]
    const args = [schema]
    return await this.db.callCanisterMethod(CanisterMethod.CreateSchema, args)
  }

  async findByTitle(title: string) {
    return this.search('title', title)
  }

  async findByAuthor(author: string) {
    return this.search('author', author)
  }
}

import { User } from '../types/index'
import { CanisterMethod, ResultBool, ResultRecords } from 'quikdb-cli-beta/v1/sdk'
import { BaseModel } from './base.model'

export class UserModel extends BaseModel<User> {
  protected schemaName = 'UserSchema'

  public async defineSchema(): Promise<void> {
    await super.defineSchema()

    try {
      // First, check if schema exists
      const existingSchemas = await this.db.callCanisterMethod<string[]>(
        CanisterMethod.ListSchemas,
        []
      )

      // If schema already exists, just return
      if (
        'ok' in existingSchemas &&
        Array.isArray(existingSchemas.ok) &&
        existingSchemas.ok.includes(this.schemaName)
      ) {
        console.log('✅ Schema already exists, skipping creation')
        return
      }

      const fields = [
        { name: 'firstName', fieldType: 'Text', required: true, unique: false },
        { name: 'lastName', fieldType: 'Text', required: true, unique: false },
        { name: 'email', fieldType: 'Text', required: true, unique: true },
        { name: 'password', fieldType: 'Text', required: true, unique: false },
        { name: 'createdAt', fieldType: 'Text', required: true, unique: false },
        { name: 'updatedAt', fieldType: 'Text', required: true, unique: false }
      ]

      const indexes = ['email']
      const args: [string, typeof fields, string[]] = [this.schemaName, fields, indexes]

      const result = await this.db.callCanisterMethod<ResultBool>(CanisterMethod.CreateSchema, args)

      if ('err' in result) {
        throw new Error(`Failed to create schema: ${result.err}`)
      }

      console.log('✅ Schema defined successfully')
    } catch (error) {
      console.error('❌ Failed to define schema:', error)
      throw error
    }
  }

  async findByEmail(email: string): Promise<ResultRecords> {
    return this.search('email', email)
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResultBool> {
    const userWithTimestamps = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return this.create(userWithTimestamps)
  }

  async updateUser(
    id: string,
    updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ResultBool> {
    return this.update(id, updates)
  }
}

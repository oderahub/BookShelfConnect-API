import { BaseModel } from './base.model'
import { User } from '../types/index'
import { CanisterMethod, ResultBool } from 'quikdb-cli-beta/v1/sdk'

export class UserModel extends BaseModel<User> {
  protected schemaName = 'UserSchema'

  protected async defineSchema(): Promise<void> {
    // Define schema for users
    const schema = [
      {
        name: 'UserSchema',
        fields: [
          { name: 'firstName', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'lastName', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'email', type: 'string', fieldType: 'Text', required: true, unique: true },
          { name: 'password', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'createdAt', type: 'string', fieldType: 'Text', required: true, unique: false },
          { name: 'updatedAt', type: 'string', fieldType: 'Text', required: true, unique: false }
        ],
        indexes: ['email'] // Removed 'username' since it's not in fields
      }
    ]
    const args = [schema]
    return await this.db.callCanisterMethod(CanisterMethod.CreateSchema, args)
  }

  async findByEmail(email: string) {
    return this.search('email', email)
  }
}

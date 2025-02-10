import { quikdb } from '../config/db'
import { CanisterMethod, CreateSchemaArgs } from 'quikdb-cli-beta/v1/sdk'

export const setupSchema = async () => {
  const schemaName = 'UserSchema'
  const fields = [
    {
      name: 'firstName',
      type: 'string',
      fieldType: 'text',
      required: true,
      unique: false
    },
    {
      name: 'lastName',
      type: 'string',
      fieldType: 'text',
      required: true,
      unique: false
    },
    {
      name: 'email',
      type: 'string',
      fieldType: 'text',
      required: true,
      unique: true
    },
    {
      name: 'password',
      type: 'string',
      fieldType: 'text',
      required: true,
      unique: false
    }
  ]
  const indexes = ['email']

  // Create schema
  const args: CreateSchemaArgs = [schemaName, fields, indexes]
  const createResult = await quikdb.callCanisterMethod(CanisterMethod.CreateSchema, args)
  console.log('Create Schema Result:', createResult)
}

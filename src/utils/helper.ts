// setup/database.ts
import { UserModel } from '../models/user.model'
import { BookModel } from '../models/book.model'
import { UserContext } from './user.context'

interface DatabaseSetupConfig {
  defineSchema: boolean
  force?: boolean
}

// Create a singleton instance of UserContext
export const globalUserContext = new UserContext()

export async function setupDatabase(config: DatabaseSetupConfig = { defineSchema: true }) {
  try {
    const userModel = new UserModel()
    const bookModel = new BookModel()

    if (config.defineSchema) {
      try {
        await userModel.defineSchema()
        await bookModel.defineSchema()
        console.log('✅ Schema setup completed successfully')
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          console.log('ℹ️ Schema already exists, continuing with startup')
        } else {
          throw error
        }
      }
    }

    console.log('✅ Database setup completed successfully')
    return { userModel, bookModel }
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  }
}

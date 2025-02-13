import { UserModel } from '../models/user.model'
import { BookModel } from '../models/book.model'

interface DatabaseSetupConfig {
  defineSchema: boolean
  force?: boolean // Could be used to force schema recreation in the future
}

export async function setupDatabase(config: DatabaseSetupConfig = { defineSchema: true }) {
  try {
    const userModel = new UserModel()
    const bookModel = new BookModel()

    if (config.defineSchema) {
      try {
        await userModel.defineSchema()
        // await bookModel.defineSchema()
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
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  }
}

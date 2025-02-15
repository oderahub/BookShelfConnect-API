import { QuikDB, CanisterMethod } from 'quikdb-cli-beta/v1/sdk'
import { logger } from '../utils/logger'

// Singleton pattern to ensure only one instance of QuikDB is created
export class Database {
  private static instance: QuikDB

  private constructor() {}

  // Static method to get the instance of QuikDB
  static async getInstance(): Promise<QuikDB> {
    if (!Database.instance) {
      Database.instance = new QuikDB()
      await Database.instance.init()
      logger.info('✅ QuikDB initialized successfully.')
    }
    return Database.instance
  }

  // ✅ Make initOwner public to be accessible in `startServer`
  public static async initOwner(instance: QuikDB): Promise<void> {
    try {
      await instance.callCanisterMethod(CanisterMethod.InitOwner, [])
    } catch (error) {
      logger.error('❌ Failed to initialize QuikDB Owner:', error)
    }
  }
}

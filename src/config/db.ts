import { QuikDB, CanisterMethod, ResultBool } from 'quikdb-cli-beta/v1/sdk'

export class Database {
  private static instance: QuikDB | null = null

  private constructor() {}

  static async getInstance(): Promise<QuikDB> {
    if (!Database.instance) {
      Database.instance = new QuikDB()
      await Database.instance.init() // Ensure QuikDB is initialized before returning
    }
    return Database.instance
  }

  static async initOwner(): Promise<void> {
    try {
      const quikdb = await Database.getInstance()
      const initOwnerResult: ResultBool = await quikdb.callCanisterMethod(
        CanisterMethod.InitOwner,
        []
      )
      if (initOwnerResult) {
        // Assuming ResultBool has an `.ok` property
        console.log('✅ QuikDB Owner initialized successfully.')
      } else {
        console.error(`❌ Error initializing owner: ${initOwnerResult}`)
      }
    } catch (error) {
      console.error(`❌ Failed to initialize QuikDB Owner:`, error)
    }
  }
}

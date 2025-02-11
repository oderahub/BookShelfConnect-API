import { QuikDB, CanisterMethod } from 'quikdb-cli-beta/v1/sdk'

// Singleton pattern to ensure only one instance of QuikDB is created
export class Database {
  private static instance: QuikDB

  private constructor() {}

  // Static method to get the instance of QuikDB
  static async getInstance(): Promise<QuikDB> {
    if (!Database.instance) {
      Database.instance = new QuikDB()
      await Database.instance.init()
      console.log('✅ QuikDB initialized successfully.')
    }
    return Database.instance
  }

  // ✅ Change from private → public so it can be accessed in `startServer`
  public static async initOwner(): Promise<void> {
    try {
      const instance = await Database.getInstance()
      const initOwnerResult = await instance.callCanisterMethod(CanisterMethod.InitOwner, [])

      if (initOwnerResult) {
        console.log('✅ QuikDB Owner initialized successfully.')
      } else {
        console.error(`❌ Error initializing owner: ${initOwnerResult}`)
      }
    } catch (error) {
      console.error('❌ Failed to initialize QuikDB Owner:', error)
    }
  }
}

// Usage example:
// (async () => {
//   const dbInstance = await Database.getInstance();
//   // Use dbInstance here
// })();

// import { QuikDB, CanisterMethod, ResultBool } from 'quikdb-cli-beta/v1/sdk'

// const quikdb: QuikDB = new QuikDB()

// ;(async () => {
//   await quikdb.init()
//   console.log('QuikDB initialized successfully.')
// })()

// // Initialize Owner (Only needed once)
// const initOwner = async () => {
//   const initOwnerResult: ResultBool = await quikdb.callCanisterMethod(CanisterMethod.InitOwner, [])
//   if (initOwnerResult) {
//     console.log('✅ QuikDB Owner initialized successfully.')
//   } else {
//     console.error(`❌ Error initializing owner: ${initOwnerResult}`)
//   }
// }

// export { quikdb, initOwner }

import { QuikDB, CanisterMethod, ResultBool } from 'quikdb-cli-beta/v1/sdk'

// Initialize QuikDB instance (only once)
const quikdb = new QuikDB()

// Function to Initialize Owner (Only needed once)
const initOwner = async () => {
  try {
    const initOwnerResult: ResultBool = await quikdb.callCanisterMethod(
      CanisterMethod.InitOwner,
      []
    )
    if (initOwnerResult) {
      console.log('✅ QuikDB Owner initialized successfully.')
    } else {
      console.error(`❌ Error initializing owner: ${initOwnerResult}`)
    }
  } catch (error) {
    console.error(`❌ Failed to initialize QuikDB Owner:`, error)
  }
}

export { quikdb, initOwner }

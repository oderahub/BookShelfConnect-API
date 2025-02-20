// test/setup.ts
import { Express } from 'express'
import { createServer } from '../src/index'
import { Server } from 'http'

let server: Server | null = null
let app: Express | null = null

export const setupTestServer = async (): Promise<Express> => {
  try {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()))
    }

    app = (await createServer()) as Express

    server = await new Promise((resolve) => {
      const srv = app!.listen(0, () => resolve(srv))
    })

    return app
  } catch (error) {
    console.error('Failed to setup test server:', error)
    throw error
  }
}

export const teardownTestServer = async (): Promise<void> => {
  try {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()))
      server = null
      app = null
    }
  } catch (error) {
    console.error('Failed to teardown test server:', error)
    throw error
  }
}

process.on('SIGINT', async () => {
  await teardownTestServer()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await teardownTestServer()
  process.exit(0)
})

// test/integration/user.test.ts
import request from 'supertest'
import { Express } from 'express'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { setupTestServer, teardownTestServer } from '../setup'
import { mockDbInstance } from '../../__mocks__/quikdb' // Updated path to match moduleNameMapper
import { v4 as uuidv4 } from 'uuid'

// Define mock implementations with proper TypeScript signatures
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (password: string, salt: number): Promise<string> => 'hashed_password'),
  compare: jest.fn(async (plain: string, hashed: string): Promise<boolean> => true)
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(
    (payload: any, secret: string, options?: jwt.SignOptions): string =>
      `test_token_${payload.userId}`
  ),
  verify: jest.fn((token: string, secret: string): jwt.JwtPayload => {
    const userId = token.split('_')[2] || 'test-user-id'
    return { userId, iat: Date.now(), exp: Date.now() + 3600000 }
  })
}))

jest.mock('quikdb-cli-beta/v1/sdk')

describe('Integration Tests', () => {
  let app: Express
  let authToken: string
  let testUserId: string

  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Test123!'
  }

  const testBook = {
    title: 'Test Book',
    author: 'Test Author',
    isbn: '1234567890',
    description: 'Test description'
  }

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret'
    testUserId = uuidv4()

    // No need to redefine mocks here since they're set up above
    app = await setupTestServer()
  })

  afterAll(async () => {
    await teardownTestServer()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockDbInstance.reset()
  })

  describe('User Controller', () => {
    test('POST /api/v1/auth/users/register - should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/users/register')
        .send(testUser)
        .expect(201)

      expect(bcrypt.hash).toHaveBeenCalledWith(testUser.password, 10)
      expect(response.body.success).toBe(true)
      expect(response.body.data.token).toMatch(/^test_token_/)
      expect(response.body.message).toBe('User registered')
      testUserId = response.body.data.token.split('_')[2] // Capture the actual userId
    })

    test('POST /api/v1/auth/users/login - should login and return token', async () => {
      const registerResponse = await request(app).post('/api/v1/auth/users/register').send(testUser)
      testUserId = registerResponse.body.data.token.split('_')[2]

      const loginResponse = await request(app)
        .post('/api/v1/auth/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)

      expect(bcrypt.compare).toHaveBeenCalledWith(testUser.password, 'hashed_password')
      expect(loginResponse.body).toEqual({
        success: true,
        data: { token: `test_token_${testUserId}` },
        message: 'Login successful'
      })
      authToken = loginResponse.body.data.token
    })

    test('POST /api/v1/auth/users/login - should fail with invalid password', async () => {
      await request(app).post('/api/v1/auth/users/register').send(testUser)

      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(
          async (data: string | Buffer, encrypted: string): Promise<boolean> => false
        )
      await request(app)
        .post('/api/v1/auth/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401)

      compareSpy.mockRestore()
    })
  })

  describe('Book Controller', () => {
    test('POST /api/v1/books - should create a new book', async () => {
      const registerResponse = await request(app).post('/api/v1/auth/users/register').send(testUser)
      testUserId = registerResponse.body.data.token.split('_')[2]

      const loginResponse = await request(app).post('/api/v1/auth/users/login').send({
        email: testUser.email,
        password: testUser.password
      })

      authToken = loginResponse.body.data.token

      const response = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBook)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        ...testBook,
        ownerId: testUserId
      })
    })

    test('POST /api/v1/books - should fail without auth token', async () => {
      await request(app).post('/api/v1/books').send(testBook).expect(401)
    })
  })
})

import { UserModel } from '../models/user.model'
import { BaseService } from './base.service'
import { User } from '../types'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { ApiResponse } from '../utils/response'
import dotenv from 'dotenv'

dotenv.config()

export class UserService extends BaseService<User> {
  constructor() {
    super(new UserModel())
  }

  async register(userData: Omit<User, 'id'>): Promise<ApiResponse<{ token: string }>> {
    try {
      const existingUser = await (this.model as UserModel).findByEmail(userData.email)

      if ('ok' in existingUser && Array.isArray(existingUser.ok) && existingUser.ok.length > 0) {
        return ApiResponse.error('Email already registered')
      }

      const hashedPassword = await hash(userData.password, 10)

      const result = await this.create({
        ...userData,
        password: hashedPassword,
        role: 'USER'
      })

      if (result.success && result.data) {
        const token = sign({ userId: result.data.id }, process.env.JWT_SECRET!, {
          expiresIn: '24h'
        })
        return ApiResponse.success({ token }, 'User registered')
      }

      return ApiResponse.error('Registration failed')
    } catch (error) {
      console.error('❌ Service error during register:', error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    try {
      const result = await (this.model as UserModel).findByEmail(email)

      if (!('ok' in result) || !Array.isArray(result.ok) || result.ok.length === 0) {
        return ApiResponse.error('Invalid credentials')
      }

      const user = result.ok[0] as unknown as User
      const isValidPassword = await compare(password, user.password)

      if (!isValidPassword) {
        return ApiResponse.error('Invalid credentials')
      }

      const token = sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' })
      return ApiResponse.success({ token }, 'Login successful')
    } catch (error) {
      console.error('❌ Service error during login:', error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

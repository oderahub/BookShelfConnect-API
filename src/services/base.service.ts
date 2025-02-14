import { BaseModel } from '../models/base.model'
import { BaseEntity } from '../types'
import { ApiResponse } from '../utils/response'
import { ResultBool, ResultRecords } from 'quikdb-cli-beta/v1/sdk'

export abstract class BaseService<T extends BaseEntity> {
  protected model: BaseModel<T>

  constructor(model: BaseModel<T>) {
    this.model = model
  }

  async create(data: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    try {
      const result: ResultBool = await this.model.create(data)

      if ('ok' in result && result.ok === true) {
        const createdEntity = { ...data, id: (result as any).id } as T
        return ApiResponse.success(createdEntity, 'Created successfully')
      } else {
        console.error(`❌ Create operation failed:`, result)
        return ApiResponse.error('Creation failed')
      }
    } catch (error) {
      console.error(`❌ Service error during create:`, error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async findById(id: string): Promise<ApiResponse<T>> {
    try {
      const result: ResultRecords = await this.model.findById(id)

      if ('ok' in result && Array.isArray(result.ok) && result.ok.length > 0) {
        return ApiResponse.success(result.ok[0] as unknown as T)
      } else {
        console.error(`❌ Record with ID ${id} not found`)
        return ApiResponse.error('Record not found')
      }
    } catch (error) {
      console.error(`❌ Service error during findById:`, error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<ApiResponse<T[]>> {
    try {
      const result: ResultRecords = await this.model.findAll(page, limit)

      if ('ok' in result && Array.isArray(result.ok)) {
        return ApiResponse.success(result.ok as unknown as T[])
      } else {
        console.error(`❌ No records found`)
        return ApiResponse.error('No records found')
      }
    } catch (error) {
      console.error(`❌ Service error during findAll:`, error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<boolean>> {
    try {
      const result: ResultBool = await this.model.update(id, data)

      if ('ok' in result && result.ok === true) {
        return ApiResponse.success(true, 'Updated successfully')
      } else {
        console.error(`❌ Update operation failed:`, result)
        return ApiResponse.error('Update failed')
      }
    } catch (error) {
      console.error(`❌ Service error during update:`, error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const result: ResultBool = await this.model.delete(id)

      if ('ok' in result && result.ok === true) {
        return ApiResponse.success(true, 'Deleted successfully')
      } else {
        console.error(`❌ Deletion operation failed:`, result)
        return ApiResponse.error('Deletion failed')
      }
    } catch (error) {
      console.error(`❌ Service error during delete:`, error)
      return ApiResponse.error(
        `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

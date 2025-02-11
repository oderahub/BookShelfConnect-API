import {
  QuikDB,
  CanisterMethod,
  ResultBool,
  ResultString,
  ResultRecords
} from 'quikdb-cli-beta/v1/sdk'
import { Database } from '../config/db'
import { BaseEntity } from '../types/index'

export abstract class BaseModel<T extends BaseEntity> {
  protected db!: QuikDB
  protected abstract schemaName: string

  constructor() {
    this.initializeDB()
  }

  private async initializeDB(): Promise<void> {
    try {
      this.db = await Database.getInstance()
    } catch (error) {
      console.error(`❌ Failed to initialize database:`, error)
      throw new Error('Database initialization failed')
    }
  }

  protected abstract defineSchema(): Promise<void>

  async create(data: Omit<T, 'id'>): Promise<ResultBool> {
    try {
      const record = {
        id: null, // Ensure QuikDB auto-generates an ID
        fields: Object.entries({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      const args = [this.schemaName, record]
      return await this.db.callCanisterMethod<ResultBool>(CanisterMethod.CreateRecordData, args)
    } catch (error) {
      console.error(`❌ Error creating record:`, error)
      throw new Error('Record creation failed')
    }
  }

  async findById(id: string): Promise<ResultRecords> {
    try {
      const args = [this.schemaName, id]
      return await this.db.callCanisterMethod<ResultRecords>(CanisterMethod.GetRecord, args)
    } catch (error) {
      console.error(`❌ Error finding record by ID:`, error)
      throw new Error('Record retrieval failed')
    }
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<ResultRecords> {
    try {
      const args = [this.schemaName]
      const result = await this.db.callCanisterMethod<ResultRecords>(
        CanisterMethod.GetAllRecords,
        args
      )

      if ('ok' in result && Array.isArray(result.ok)) {
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        return { ok: result.ok.slice(startIndex, endIndex) }
      } else {
        console.error(`❌ Unexpected response format:`, result)
        throw new Error('Invalid response format from database')
      }
    } catch (error) {
      console.error(`❌ Error fetching all records:`, error)
      throw new Error('Record retrieval failed')
    }
  }

  async update(id: string, data: Partial<T>): Promise<ResultBool> {
    try {
      const updateData = { ...data, updatedAt: new Date().toISOString() }
      const args = [this.schemaName, id, Object.entries(updateData)]
      return await this.db.callCanisterMethod<ResultBool>(CanisterMethod.UpdateData, args)
    } catch (error) {
      console.error(`❌ Error updating record:`, error)
      throw new Error('Record update failed')
    }
  }

  async delete(id: string): Promise<ResultBool> {
    try {
      const args = [this.schemaName, id]
      return await this.db.callCanisterMethod<ResultBool>(CanisterMethod.DeleteRecord, args)
    } catch (error) {
      console.error(`❌ Error deleting record:`, error)
      throw new Error('Record deletion failed')
    }
  }

  async search<K extends keyof T>(field: K, value: string): Promise<ResultRecords> {
    try {
      const args = [this.schemaName, String(field), value]
      return await this.db.callCanisterMethod<ResultRecords>(CanisterMethod.SearchByIndex, args)
    } catch (error) {
      console.error(`❌ Error searching records:`, error)
      throw new Error('Search operation failed')
    }
  }
}

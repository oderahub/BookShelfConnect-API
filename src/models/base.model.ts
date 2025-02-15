import {
  QuikDB,
  CanisterMethod,
  ResultBool,
  ResultRecords,
  GetRecordArgs,
  UpdateDataArgs,
  DeleteDataArgs
} from 'quikdb-cli-beta/v1/sdk'
import { Database } from '../config/db'
import { BaseEntity } from '../types/index'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'

export abstract class BaseModel<T extends BaseEntity> {
  protected db!: QuikDB
  protected abstract schemaName: string

  constructor() {
    this.initializeDB()
  }

  public async initializeDB(): Promise<void> {
    try {
      this.db = await Database.getInstance()
      logger.info('Database initialized successfully!')
    } catch (error) {
      logger.error(`❌ Failed to initialize database:`, error)
      throw new Error('Database initialization failed')
    }
  }

  // Ensure methods that need db are async and check if db is initialized
  public async defineSchema(): Promise<void> {
    if (!this.db) {
      await this.initializeDB() // Await here if db is not set
    }
    // Here you would define what 'defineSchema' means for this base model if needed
  }

  async create(data: Omit<T, 'id'>): Promise<ResultBool> {
    if (!this.db) {
      await this.initializeDB()
    }
    try {
      const record = {
        id: uuidv4(),
        fields: Object.entries({
          ...data,
          createdAt: new Date().toString(),
          updatedAt: new Date().toString()
        })
      }
      logger.info(`Creating record with ID: ${record.id}`)
      const args = [this.schemaName, record]
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Data cannot be empty')
      }

      return await this.db.callCanisterMethod<ResultBool>(CanisterMethod.CreateRecordData, args)
    } catch (error) {
      logger.error(`❌ Error creating record:`, error)
      throw new Error('Record creation failed')
    }
  }

  async findById(id: string): Promise<ResultRecords> {
    if (!this.db) {
      await this.initializeDB()
    }
    try {
      const getRecordArgs: GetRecordArgs = [this.schemaName, id] // Pass the actual ID value
      const result = await this.db.callCanisterMethod<ResultRecords>(
        CanisterMethod.GetRecord,
        getRecordArgs
      )
      if ('err' in result) {
        logger.error(`❌ Error finding record by ID: ${result.err}`)
        throw new Error(`Record retrieval failed: ${result.err}`)
      }
      return result
    } catch (error) {
      logger.error(`❌ Error finding record by ID:`, error)
      throw new Error('Record retrieval failed')
    }
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<ResultRecords> {
    if (!this.db) {
      await this.initializeDB()
    }
    try {
      const args = [this.schemaName]
      const result = await this.db.callCanisterMethod<ResultRecords>(
        CanisterMethod.GetAllRecords,
        args
      )
      // Then handle pagination

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
    if (!this.db) {
      await this.initializeDB()
    }
    try {
      // Check if record exists
      const existingRecord = await this.findById(id)
      if ('err' in existingRecord || !existingRecord.ok.length) {
        throw new Error('Record not found')
      }

      const updateData = { ...data, updatedAt: new Date().toString() }
      const args: UpdateDataArgs = [
        this.schemaName,
        id,
        Object.entries(updateData).map(([key, value]) => [key, String(value)])
      ]
      const result = await this.db.callCanisterMethod<ResultBool>(CanisterMethod.UpdateData, args)
      if ('err' in result) {
        logger.error(`❌ Error updating record: ${result.err}`)
        throw new Error(`Update failed: ${result.err}`)
      }
      return result
    } catch (error) {
      logger.error(`❌ Error updating record:`, error)
      throw new Error('Record update failed')
    }
  }

  async delete(id: string): Promise<ResultBool> {
    if (!this.db) {
      await this.initializeDB()
    }
    try {
      const args: DeleteDataArgs = [this.schemaName, id]
      return await this.db.callCanisterMethod<ResultBool>(CanisterMethod.DeleteRecord, args)
    } catch (error) {
      logger.error(`❌ Error deleting record:`, error)
      throw new Error('Record deletion failed')
    }
  }

  async search<K extends keyof T>(field: K, value: string): Promise<ResultRecords> {
    if (!this.db) {
      await this.initializeDB()
    }
    try {
      const args = [this.schemaName, String(field), value]
      return await this.db.callCanisterMethod<ResultRecords>(CanisterMethod.SearchByIndex, args)
    } catch (error) {
      logger.error(`❌ Error searching records:`, error)
      throw new Error('Search operation failed')
    }
  }

  // async searchByMultipleFields(criteria: [keyof T, string][]): Promise<ResultRecords> {
  //   try {
  //     const args: SearchByMultipleFieldsArgs = [this.schemaName, criteria as [string, string][]]
  //     return await this.db.callCanisterMethod<ResultRecords>(
  //       CanisterMethod.SearchByMultipleFields,
  //       args
  //     )
  //   } catch (error) {
  //     console.error(`❌ Error searching by multiple fields:`, error)
  //     throw new Error('Search operation failed')
  //   }
  // }
}

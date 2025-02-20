// // __mocks__/quikdb-cli-beta/v1/sdk.ts
// export const CanisterMethod = {
//   CreateRecordData: 'CreateRecordData',
//   GetRecord: 'GetRecord',
//   GetAllRecords: 'GetAllRecords',
//   SearchByIndex: 'SearchByIndex',
//   UpdateData: 'UpdateData',
//   DeleteRecord: 'DeleteRecord',
//   InitOwner: 'InitOwner',
//   CreateSchema: 'CreateSchema',
//   ListSchemas: 'ListSchemas'
// } as const

// type Field = [string, string]
// type Record = { id: string; fields: Field[] }
// type ResultRecords = { ok: Record[] } | { err: string }
// type ResultBool = { ok: boolean } | { err: string }

// class MockQuikDB {
//   private static instance: MockQuikDB | null = null
//   private initialized = false
//   private records: Map<string, Record[]> = new Map()

//   constructor() {
//     this.records.set('UserSchema', [])
//     this.records.set('BookSchema', [])
//   }

//   async init(): Promise<ResultBool> {
//     if (this.initialized) {
//       return { ok: true }
//     }
//     this.initialized = true
//     return { ok: true }
//   }

//   async callCanisterMethod<T>(method: string, args: any[]): Promise<T> {
//     if (!this.initialized) {
//       throw new Error('Database not initialized')
//     }

//     const [schema] = args

//     switch (method) {
//       case CanisterMethod.InitOwner:
//         return { ok: true } as T
//       case CanisterMethod.CreateSchema:
//         return { ok: true } as T
//       case CanisterMethod.ListSchemas:
//         return { ok: Array.from(this.records.keys()) } as T
//       case CanisterMethod.CreateRecordData:
//         const [, record] = args
//         const records = this.records.get(schema) || []
//         const userId = record.id || 'test-user-id'
//         records.push({ ...record, id: userId })
//         this.records.set(schema, records)
//         return { ok: true } as T
//       case CanisterMethod.SearchByIndex:
//         const [, field, value] = args
//         const allRecords = this.records.get(schema) || []
//         const matchingRecords = allRecords.filter((r) =>
//           r.fields.some(([f, v]) => f === field && v === value)
//         )
//         return { ok: matchingRecords } as T
//       default:
//         return { ok: true } as T
//     }
//   }

//   static getInstance(): MockQuikDB {
//     if (!MockQuikDB.instance) {
//       MockQuikDB.instance = new MockQuikDB()
//     }
//     return MockQuikDB.instance
//   }

//   reset(): void {
//     this.records.clear()
//     this.records.set('UserSchema', [])
//     this.records.set('BookSchema', [])
//     this.initialized = false
//   }
// }

// export const QuikDB = jest.fn().mockImplementation(() => {
//   return MockQuikDB.getInstance()
// })

// export const mockDbInstance = MockQuikDB.getInstance()

export const CanisterMethod = {
  CreateRecordData: 'CreateRecordData',
  GetRecord: 'GetRecord',
  GetAllRecords: 'GetAllRecords',
  SearchByIndex: 'SearchByIndex',
  UpdateData: 'UpdateData',
  DeleteRecord: 'DeleteRecord',
  InitOwner: 'InitOwner',
  CreateSchema: 'CreateSchema',
  ListSchemas: 'ListSchemas'
} as const

type Field = [string, string]
type Record = { id: string; fields: Field[] }
type ResultRecords = { ok: Record[] } | { err: string }
type ResultBool = { ok: boolean; id?: string } | { err: string }

class MockQuikDB {
  private static instance: MockQuikDB | null = null
  private initialized = false
  private records: Map<string, Record[]> = new Map()

  constructor() {
    this.records.set('UserSchema', [])
    this.records.set('BookSchema', [])
  }

  async init(): Promise<ResultBool> {
    if (this.initialized) return { ok: true }
    this.initialized = true
    return { ok: true }
  }

  async callCanisterMethod<T>(method: string, args: any[]): Promise<T> {
    if (!this.initialized) throw new Error('Database not initialized')
    const [schema] = args

    switch (method) {
      case CanisterMethod.InitOwner:
        return { ok: true } as T
      case CanisterMethod.CreateSchema:
        return { ok: true } as T
      case CanisterMethod.ListSchemas:
        return { ok: Array.from(this.records.keys()) } as T
      case CanisterMethod.CreateRecordData:
        const [, newRecord] = args
        const records = this.records.get(schema) || []
        const userId = newRecord.id || 'test-user-id'
        records.push({ ...newRecord, id: userId })
        this.records.set(schema, records)
        return { ok: true, id: userId } as T
      case CanisterMethod.GetRecord:
        const [, recordId] = args
        const allRecords = this.records.get(schema) || []
        const record = allRecords.find((r) => r.id === id)
        return (record ? { ok: [record] } : { err: 'Record not found' }) as T
      case CanisterMethod.GetAllRecords:
        return { ok: this.records.get(schema) || [] } as T
      case CanisterMethod.SearchByIndex:
        const [, field, value] = args
        const schemaRecords = this.records.get(schema) || []
        const matchingRecords = schemaRecords.filter((r) =>
          r.fields.some(([f, v]) => f === field && v === value)
        )
        return { ok: matchingRecords } as T
      case CanisterMethod.UpdateData:
        const [, id, updates] = args
        const updateRecords = this.records.get(schema) || []
        const index = updateRecords.findIndex((r) => r.id === id)
        if (index !== -1) {
          updateRecords[index].fields = updates
          this.records.set(schema, updateRecords)
          return { ok: true } as T
        }
        return { err: 'Record not found' } as T
      case CanisterMethod.DeleteRecord:
        const [, deleteId] = args
        const deleteRecords = this.records.get(schema) || []
        this.records.set(
          schema,
          deleteRecords.filter((r) => r.id !== deleteId)
        )
        return { ok: true } as T
      default:
        return { ok: true } as T
    }
  }

  async create(data: { schema: string; record: Record }): Promise<ResultBool & { id: string }> {
    const { schema, record } = data
    const records = this.records.get(schema) || []
    const id = record.id || 'test-id'
    records.push({ ...record, id })
    this.records.set(schema, records)
    return { ok: true, id }
  }

  async findByEmail(email: string): Promise<ResultRecords> {
    const userRecords = this.records.get('UserSchema') || []
    const matchingRecords = userRecords.filter((r) =>
      r.fields.some(([field, value]) => field === 'email' && value === email)
    )
    return { ok: matchingRecords }
  }

  async findById(id: string, schema: string): Promise<ResultRecords> {
    const records = this.records.get(schema) || []
    const record = records.find((r) => r.id === id)
    return record ? { ok: [record] } : { err: 'Record not found' }
  }

  static getInstance(): MockQuikDB {
    if (!MockQuikDB.instance) {
      MockQuikDB.instance = new MockQuikDB()
    }
    return MockQuikDB.instance
  }

  reset(): void {
    this.records.clear()
    this.records.set('UserSchema', [])
    this.records.set('BookSchema', [])
    this.initialized = false
  }
}

// Mock QuikDB constructor
export const QuikDB = jest.fn().mockImplementation(() => MockQuikDB.getInstance())

// Export mockDbInstance as Jest mocks
export const mockDbInstance = {
  create: jest
    .fn()
    .mockImplementation((data: { schema: string; record: Record }) =>
      MockQuikDB.getInstance().create(data)
    ),
  findByEmail: jest
    .fn()
    .mockImplementation((email: string) => MockQuikDB.getInstance().findByEmail(email)),
  findById: jest
    .fn()
    .mockImplementation((id: string, schema: string) =>
      MockQuikDB.getInstance().findById(id, schema)
    ),
  callCanisterMethod: jest
    .fn()
    .mockImplementation((method: string, args: any[]) =>
      MockQuikDB.getInstance().callCanisterMethod(method, args)
    ),
  reset: jest.fn().mockImplementation(() => MockQuikDB.getInstance().reset())
}

// Type assertion to satisfy TypeScript
export interface MockQuikDBInterface {
  create: jest.Mock<Promise<ResultBool & { id: string }>, [{ schema: string; record: Record }]>
  findByEmail: jest.Mock<Promise<ResultRecords>, [string]>
  findById: jest.Mock<Promise<ResultRecords>, [string, string]>
  callCanisterMethod: jest.Mock<Promise<any>, [string, any[]]>
  reset: jest.Mock<void, []>
}

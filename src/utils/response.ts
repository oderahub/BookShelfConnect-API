export class ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string

  constructor(success: boolean, data?: T, error?: string, message?: string) {
    this.success = success
    this.data = data
    this.error = error
    this.message = message
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(true, data, undefined, message)
  }

  static error<T>(error: string, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(false, undefined, error, message)
  }
}

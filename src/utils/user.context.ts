export class UserContext {
  private userId: string | null = null

  constructor(userId?: string) {
    if (userId) {
      this.userId = userId
    }
  }

  async getCurrentUserId(): Promise<string> {
    if (!this.userId) {
      throw new Error('No user authenticated')
    }
    return this.userId
  }

  setUserId(userId: string) {
    this.userId = userId
  }
}

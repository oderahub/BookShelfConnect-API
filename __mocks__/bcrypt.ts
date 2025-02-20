const bcrypt = jest.createMockFromModule<typeof import('bcrypt')>('bcrypt')

bcrypt.hash = jest.fn(
  async (data: string | Buffer, saltOrRounds: string | number) => 'hashed_password'
)
bcrypt.compare = jest.fn(async (data: string | Buffer, encrypted: string) => true)

module.exports = bcrypt

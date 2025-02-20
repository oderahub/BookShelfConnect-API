const jwt = jest.createMockFromModule<typeof import('jsonwebtoken')>('jsonwebtoken')

jwt.sign = jest.fn(
  (payload: any, secretOrPrivateKey: any, options?: any) => `test_token_${payload.userId}`
)
jwt.verify = jest.fn((token: string, secretOrPublicKey: any) => ({
  header: { alg: 'HS256', typ: 'JWT' },
  payload: {
    userId: token.split('_')[2],
    iat: Date.now(),
    exp: Date.now() + 3600000
  },
  signature: 'test_signature'
}))

module.exports = jwt

import jwt from 'jsonwebtoken'

interface TokenPayload {
  uuid: string
  email: string
}

function generateToken (
  payload: TokenPayload,
  expiresIn: string = '1h'
): string {
  const secretKey = process.env.JWT_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing JWT_SECRET_KEY environment variable')
  }
  return jwt.sign(payload, secretKey, { expiresIn })
}

export { generateToken, TokenPayload }

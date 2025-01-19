import jwt from 'jsonwebtoken'
import { BadRequestError, ErrorHandle } from '../../domain/utils/error-handle'

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

async function verifyToken (token: string): Promise<TokenPayload | ErrorHandle> 
{
  const secretKey = process.env.JWT_SECRET_KEY
  if (!secretKey) {
    throw new Error('Missing JWT_SECRET_KEY environment variable')
  }
  try {
    const result = jwt.verify(token, secretKey)
    if(typeof result !== 'object' || !result.uuid || !result.email)
    {
      throw new BadRequestError('Invalid access token')
    }

    const { uuid, email } = result
    return { uuid, email }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new BadRequestError('Invalid access token')
  }
}

export { generateToken, verifyToken, TokenPayload }

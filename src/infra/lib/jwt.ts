import jwt from 'jsonwebtoken'
import { BadRequestError, ErrorHandle } from '../../domain/utils/error-handle'
import { JWT_SECRET_KEY } from '../config/env'

interface TokenPayload {
  uuid: string
  email: string
}

const secretKey = JWT_SECRET_KEY

function generateToken (
  payload: TokenPayload,
  expiresIn: string = '1h'
): string {

  return jwt.sign(payload, secretKey, { expiresIn })
}

async function verifyToken (token: string): Promise<TokenPayload | ErrorHandle> 
{
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

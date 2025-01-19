import { FastifyReply, FastifyRequest } from 'fastify'
import { verifyToken } from '../../lib/jwt'
import { ErrorHandle } from '../../../domain/utils/error-handle'


export async function authorizationMiddleware (request: FastifyRequest, reply: FastifyReply) 
{
  const authHeaders = request.headers.authorization
  if(!authHeaders) 
  {
    return reply.status(401).send({
      message: 'Credentials not informed',
    })
  }

  const [authType, token] = authHeaders.split(' ')
  if(authType !== 'Bearer' || !token)
  {
    return reply.status(400).send({
      message: 'Invalid authentication type',
    }) 
  }

  const result = await verifyToken(token)
  if(result instanceof ErrorHandle)
  {
    return reply.status(400).send({
      message: result.message,
    })
  }

  request.account = result
}
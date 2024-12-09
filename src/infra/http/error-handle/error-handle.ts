import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { ErrorHandle } from '../../../domain/utils/error-handle'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {

  if(error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Invalid input',
      errors: error.flatten().fieldErrors
    })
  }


  if(error instanceof ErrorHandle) {
    return reply.status(error.getCode()).send({ message: error.message })
  }

  reply.status(500).send({ message: 'Internal server error' })

}
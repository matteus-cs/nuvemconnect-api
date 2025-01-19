import 'fastify'

declare module 'fastify' {
    interface FastifyRequest
    {
        account?: {
            uuid: string,
            email: string
        } 
    }
}
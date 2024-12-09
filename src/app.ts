import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { accountRoute } from './infra/http/routes/account-routes'
import { errorHandler } from './infra/http/error-handle/error-handle'
import { resolve } from 'node:path'
import cors from '@fastify/cors'

export class App {
  server = fastify({
    logger: true
  })

  constructor () {
    this.plugins()
    this.routes()
    this.setSecurityHeaders()
  }

  routes () {
    this.server.get('/hello-world', () => {
      return 'Hello World'
    })
    this.server.register(accountRoute)
  }
  plugins () {
    this.server.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'accept', 'api_key']
    })
    this.server.setSerializerCompiler(serializerCompiler)
    this.server.setValidatorCompiler(validatorCompiler)
    this.server.setErrorHandler(errorHandler)

    this.server.register(swagger, {
      mode: 'static',
      specification: {
        path: './src/infra/http/docs/docs.json',
        postProcessor: function (swaggerObject) {
          return swaggerObject
        },
        baseDir: resolve()
      }
    })
    this.server.register(swaggerUI, {
      routePrefix: '/docs'
    })
  }

  setSecurityHeaders () {
    // Adiciona os cabeçalhos de segurança usando o hook onRequest
    this.server.addHook('onRequest', (request, reply, done) => {
      reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
      reply.header('Cross-Origin-Embedder-Policy', 'require-corp')
      done()
    })
  }
}

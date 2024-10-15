import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { CreateAccountUseCase } from '../../../use-cases/user/create-account-use-cases'
import { AccountRepositoryMongoose } from '../../database/mongoose/repositories/account-repository-mongoose'
import { NotFoundError, UnprocessableEntityError } from '../../../domain/utils/error-handle'
import { LoginUseCase } from '../../../use-cases/user/login-use-case'
import { resetPasswordUseCase } from '../../../use-cases/user/reset-password-use-case'
import { RequestPasswordResetUseCase } from '../../../use-cases/user/request-password-reset-use-case'
import { MailtrapSendEmail } from '../../lib/mail-trap-send-email'
import { PasswordResetTokenRepositoryMongoose } from '../../database/mongoose/repositories/password-reset-token-repository-mongoose'
import { UpdateAccountUseCase } from '../../../use-cases/user/update-account-use-case'
import { getUserInfo, oauth2Client } from '../../lib/google-api'
import { FindByEmail } from '../../../use-cases/user/find-by-email'
import { generateRandomPassword } from '../../../domain/utils/generate-random-password'
import { generateToken } from '../../lib/jwt'
import { Email } from '../../../domain/entities/email'

export async function accountRoute (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/account',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
          passwordConfirmation: z.string()
        })
      }
    },
    async (req, res) => {
      const { name, email, password, passwordConfirmation } = req.body
      if (password != passwordConfirmation) {
        throw new UnprocessableEntityError(
          'password confirmation different from password'
        )
      }
      const accountRepository = new AccountRepositoryMongoose()
      const sendEmail = new MailtrapSendEmail()
      const createAccountUseCase = new CreateAccountUseCase(accountRepository, sendEmail)
      const account = await createAccountUseCase.execute({
        name,
        email,
        password
      })
      res.send({ uuid: account.uuid })
    }
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/account/login',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string()
        })
      }
    },
    async (req, res) => {
      const { email, password } = req.body
      const accountRepository = new AccountRepositoryMongoose()
      const loginUseCase = new LoginUseCase(accountRepository)
      const token = await loginUseCase.execute({ email, password })
      res.send({ token })
    }
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/account/request-password-reset',
    {
      schema: {
        body: z.object({
          email: z.string().email()
        })
      }
    },
    async (req, res) => {
      const { email } = req.body

      const passwordResetTokenRepository = new PasswordResetTokenRepositoryMongoose()
      const sendEmail = new MailtrapSendEmail()

      const accountRepository = new AccountRepositoryMongoose()
      const requestPasswordResetUseCase = new RequestPasswordResetUseCase(accountRepository, passwordResetTokenRepository, sendEmail)
      const output = await requestPasswordResetUseCase.execute(email)

      res.status(200).send(output)
    }
  )

  fastify.withTypeProvider<ZodTypeProvider>().put(
    '/account/reset-password',
    {
      schema: {
        body: z.object({
          tokenUUID: z.string().uuid(),
          token: z.string().length(6),
          email: z.string().email(),
          password: z.string(),
          passwordConfirmation: z.string()
        })
      }
    },
    async (req, res) => {
      const { token, tokenUUID, email, password, passwordConfirmation } = req.body
      if (password != passwordConfirmation) {
        throw new UnprocessableEntityError(
          'password confirmation different from password'
        )
      }
      const accountRepository = new AccountRepositoryMongoose()
      const passwordResetTokenRepository = new PasswordResetTokenRepositoryMongoose()
      const resetPassword = new resetPasswordUseCase(passwordResetTokenRepository, accountRepository)
      await resetPassword.execute({ tokenUUID, token, email, password })
      return res.status(200).send()
    }
  )

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/account/activate/:uuid',
    {
      schema: {
        params: z.object({
          uuid: z.string().uuid()
        })
      }
    },
    async (req, res) => {
      const accountRepository = new AccountRepositoryMongoose()
      const updateAccountUseCase = new UpdateAccountUseCase(accountRepository)

      await updateAccountUseCase.execute(req.params.uuid, { isActive: true })

      res.status(200).send()

    }
  )

  fastify.withTypeProvider<ZodTypeProvider>().get('/login/google', (req, reply) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.email', 
        'https://www.googleapis.com/auth/userinfo.profile']
    })

    reply.redirect(url)
  })

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/auth/google/callback',
    {
      schema: {
        querystring: z.object({
          code: z.string()
        })
      }
    },
    async (req, reply) => {

      const { code } = req.query

      const { tokens } = await oauth2Client.getToken(code)

      const userInfo = await getUserInfo(tokens.access_token as string, tokens.refresh_token as string)

      const accountRepository = new AccountRepositoryMongoose()
      let account
      try {      
        const findAccountByEmailUseCase = new FindByEmail(accountRepository)
        account = await findAccountByEmailUseCase.execute(new Email(userInfo.email as string))
      } catch (error) {
        if(error instanceof NotFoundError){
          const password = await generateRandomPassword(8)
          const createAccountUseCase = new CreateAccountUseCase(accountRepository)
          account = await createAccountUseCase.execute({
            email: userInfo.email as string, 
            name: userInfo.name as string,
            password: password,
            isActive: userInfo.verified_email ?? null
          })
        } else {
          throw error
        }
      }
      const accessToken = generateToken({ email: account.email.value, uuid: account.uuid })
      return reply.status(200).send({ accessToken })

    })

}

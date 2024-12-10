import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { CreateAccountUseCase } from '../../../use-cases/user/create-account-use-cases'
import { AccountRepositoryMongoose } from '../../database/mongoose/repositories/account-repository-mongoose'
import {
  NotFoundError,
  UnprocessableEntityError
} from '../../../domain/utils/error-handle'
import { LoginUseCase } from '../../../use-cases/user/login-use-case'
import { resetPasswordUseCase } from '../../../use-cases/user/reset-password-use-case'
import { RequestPasswordResetUseCase } from '../../../use-cases/user/request-password-reset-use-case'
import { MailtrapSendEmail } from '../../lib/mail-trap-send-email'
import { PasswordResetTokenRepositoryMongoose } from '../../database/mongoose/repositories/password-reset-token-repository-mongoose'
import { UpdateAccountUseCase } from '../../../use-cases/user/update-account-use-case'
import {
  oauth2Client,
  oauth2ClientDrive,
  getAccountCloudInfo,
  manageOauthTokens
} from '../../lib/google-api'
import { google } from 'googleapis'
import { FindByEmail } from '../../../use-cases/user/find-by-email'
import { generateRandomPassword } from '../../../domain/utils/generate-random-password'
import { generateToken } from '../../lib/jwt'
import { Email } from '../../../domain/entities/email'
import 'dotenv/config'
import { CloudAccount } from '../../../domain/entities/cloudAccount'
import { CloudAccountRepositoryMongoose } from '../../database/mongoose/repositories/cloudAccount-repository-mongoose'

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
      const createAccountUseCase = new CreateAccountUseCase(
        accountRepository,
        sendEmail
      )
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

      const passwordResetTokenRepository =
        new PasswordResetTokenRepositoryMongoose()
      const sendEmail = new MailtrapSendEmail()

      const accountRepository = new AccountRepositoryMongoose()
      const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
        accountRepository,
        passwordResetTokenRepository,
        sendEmail
      )
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
      const { token, tokenUUID, email, password, passwordConfirmation } =
        req.body
      if (password != passwordConfirmation) {
        throw new UnprocessableEntityError(
          'password confirmation different from password'
        )
      }
      const accountRepository = new AccountRepositoryMongoose()
      const passwordResetTokenRepository =
        new PasswordResetTokenRepositoryMongoose()
      const resetPassword = new resetPasswordUseCase(
        passwordResetTokenRepository,
        accountRepository
      )
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

      res
        .header(
          'Location',
          'https://nuvemconnect.vercel.app/login?emailConfirmed=true'
        )
        .code(302)
        .send()
    }
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/login/google',
    {
      schema: {
        body: z.object({
          code: z.string()
        })
      }
    },
    async (req, reply) => {
      const { code } = req.body
      const token = await oauth2Client.verifyIdToken({
        idToken: code,
        audience: process.env.CLIENT_ID
      })
      const tokenInfo = token.getPayload()
      if (!tokenInfo) {
        throw new UnprocessableEntityError('invalid access token')
      }
      const accountRepository = new AccountRepositoryMongoose()
      let account
      try {
        const findAccountByEmailUseCase = new FindByEmail(accountRepository)
        account = await findAccountByEmailUseCase.execute(
          new Email(tokenInfo.email as string)
        )
      } catch (error) {
        if (error instanceof NotFoundError) {
          const password = await generateRandomPassword(8)
          const createAccountUseCase = new CreateAccountUseCase(
            accountRepository
          )
          account = await createAccountUseCase.execute({
            email: tokenInfo.email as string,
            name: tokenInfo.name as string,
            password: password,
            isActive: tokenInfo.email_verified ?? false
          })
        } else {
          throw error
        }
      }
      const accessToken = generateToken({
        email: account.email.value,
        uuid: account.uuid
      })
      reply.status(200).send({ accessToken })
    }
  )

  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get('/auth/google-drive', (req, reply) => {
      const scopes = ['https://www.googleapis.com/auth/drive']
      const url = oauth2ClientDrive.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
      })
      reply.redirect(url)
    })

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/auth/google-drive/callback',
    {
      schema: {
        querystring: z.object({
          code: z.string()
        })
      }
    },
    async (req, reply) => {
      const { code } = req.query

      const { tokens, userEmail } = await getAccountCloudInfo(code)
      if (!tokens || !tokens.access_token) {
        throw new Error('Tokens do Google inválidos.')
      }
      const cloudAccountRepository = new CloudAccountRepositoryMongoose()
      const expiryDate = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date()

      const cloudAccount = CloudAccount.create(
        userEmail,
        'google-drive',
        tokens.access_token,
        expiryDate,
        tokens.refresh_token as string
      )
      await cloudAccountRepository.save(cloudAccount)

      reply
        .status(200)
        .send({ message: 'Conta do Google Drive conectada com sucesso' })
    }
  )

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/google-drive/list-files',
    {
      schema: {
        body: z.object({
          userEmail: z.string().email(),
          provider: z.string()
        })
      }
    },
    async (req, reply) => {
      try {
        const { userEmail, provider } = req.body
        if (!userEmail || !provider) {
          throw new UnprocessableEntityError(
            'User email and provider is required.'
          )
        }

        const cloudAccountRepository = new CloudAccountRepositoryMongoose()
        const cloudAccount =
          await cloudAccountRepository.findByUserEmailAndProvider(
            userEmail,
            provider
          )
        if (!cloudAccount) {
          throw new UnprocessableEntityError(
            'User email and provider is required.'
          )
        }

        const response = await manageOauthTokens(
          cloudAccount.accessToken,
          cloudAccount.refreshToken
        )
        cloudAccountRepository.updateTokens(
          cloudAccount._id,
          response?.credentials.access_token as string,
          response?.credentials.refresh_token as string,
          response?.newExpiryDate
        )

        const drive = google.drive({ version: 'v3', auth: oauth2ClientDrive })

        const res = await drive.files.list({
          pageSize: 10,
          fields: 'nextPageToken, files(id, name)'
        })

        console.log('Files:', res.data.files)
        reply.status(200).send(res.data.files)
      } catch (error) {
        console.error('Erro ao buscar arquivos:', error)
        throw error
      }
    }
  )
}

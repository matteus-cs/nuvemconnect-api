import { z } from 'zod'
import 'dotenv/config'

const mailEnvSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
  USER: z.string(),
  PASS: z.string()
})

type MailEnvType = z.infer<typeof mailEnvSchema>
const mailEnv = mailEnvSchema.parse({
  HOST: process.env.MAIL_HOST,
  PORT: process.env.MAIL_PORT,
  USER: process.env.MAIL_USER,
  PASS: process.env.MAIL_PASS
})


const googleEnvSchema = z.object({
  CLIENT_ID: z.string(),
  CLIENT_SECRET_KEY: z.string(),
  GOOGLE_REDIRECT_URL: z.string(),
  GOOGLE_REDIRECT_URL_DRIVE: z.string(),
})

type GoogleEnvType = z.infer<typeof googleEnvSchema>
const googleEnv = googleEnvSchema.parse({
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET_KEY: process.env.CLIENT_SECRET_KEY,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL,
  GOOGLE_REDIRECT_URL_DRIVE: process.env.GOOGLE_REDIRECT_URL_DRIVE,
})

const jwtEnvSchema = z.string().min(10)
type JwtSecretKeyType= z.infer<typeof jwtEnvSchema>
const JWT_SECRET_KEY = jwtEnvSchema.parse(process.env.JWT_SECRET_KEY)


const bdEnvSchema = z.object({
  CONNECT_STRING_EXTERNAL_MONGODB: z.string(),
  CONNECT_STRING_INTERNAL_MONGODB: z.string(),
})

type BdEnvType = z.infer<typeof bdEnvSchema>
const bdEnv = bdEnvSchema.parse({
  CONNECT_STRING_EXTERNAL_MONGODB: process.env.CONNECT_STRING_EXTERNAL_MONGODB,
  CONNECT_STRING_INTERNAL_MONGODB: process.env.CONNECT_STRING_INTERNAL_MONGODB,
})

const urlsEnvSchema = z.object({
  URL_API: z.string(),
  URL_FRONTEND: z.string(),
})

type UrlsEnvType = z.infer<typeof googleEnvSchema>
const urlsEnv = urlsEnvSchema.parse({
  URL_API: process.env.URL_API,
  URL_FRONTEND: process.env.URL_FRONTEND,
})




export {
  mailEnvSchema,
  MailEnvType,
  mailEnv,
  googleEnvSchema,
  GoogleEnvType,
  googleEnv,
  jwtEnvSchema,
  JwtSecretKeyType,
  JWT_SECRET_KEY,
  bdEnvSchema,
  BdEnvType,
  bdEnv,
  urlsEnvSchema,
  UrlsEnvType,
  urlsEnv
} 
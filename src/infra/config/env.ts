import { z } from 'zod'
import 'dotenv/config'

const mailEnvSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
  USER: z.string(),
  PASS: z.string()
})

export type MailEnv = z.infer<typeof mailEnvSchema>
export const mailEnv = mailEnvSchema.parse({
  HOST: process.env.MAIL_HOST,
  PORT: process.env.MAIL_PORT,
  USER: process.env.MAIL_USER,
  PASS: process.env.MAIL_PASS
})
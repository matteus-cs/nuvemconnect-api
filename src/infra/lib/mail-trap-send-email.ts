import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { dataType, SendMail } from '../../domain/shared/send-email'
import { mailEnv } from '../config/env'


type mailClientType = Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>

export class MailtrapSendEmail implements SendMail{
  private mailClient: mailClientType
  constructor () {
    this.mailClient = nodemailer.createTransport({
      host: mailEnv.HOST,
      port: mailEnv.PORT,
      auth: {
        user: mailEnv.USER,
        pass: mailEnv.PASS
      }
    })
  }
  async handle (data: dataType): Promise<void> {
    try {
      await this.mailClient.sendMail(data)
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
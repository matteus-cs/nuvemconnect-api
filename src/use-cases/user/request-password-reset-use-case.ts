import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token-repository'
import { SendMail } from '../../domain/shared/send-email'
import { PasswordResetToken } from '../../domain/entities/passwordResetToken'
import { IAccountRepository } from '../../domain/repositories/account-repository'
import { Account } from '../../domain/entities/account'
import { UnprocessableEntityError } from '../../domain/utils/error-handle'


export class RequestPasswordResetUseCase {
  constructor (
    private readonly accountRepository: IAccountRepository,
    private readonly passwordResetToken: PasswordResetTokenRepository,
    private readonly sendEmail: SendMail
  ){}
  async execute (email: string) {
    const account = <Account>await this.accountRepository.findByEmail(email)
    if(!account.isActive) {
      throw new UnprocessableEntityError('Account not activated')
    }
    const countTokenAlreadyExists = await this.passwordResetToken.count(email)
    if(countTokenAlreadyExists === 2) {
      throw new UnprocessableEntityError('token quantity limit exceeded')
    } else if (countTokenAlreadyExists === 1) {
      const [token] = <PasswordResetToken[]>await this.passwordResetToken.findTokenByEmail(email)
      if(new Date().getMinutes() - token.createdAt.getMinutes() < 1) {
        throw new UnprocessableEntityError('Wait before requesting a new code')
      } 
      token.status = 'deactivated'
    }

    const { customAlphabet } = await import('nanoid')
    const nanoid = customAlphabet('0123456789')
    const token = nanoid(6)
    const passwordResetToken = PasswordResetToken.create(email, token)
    this.sendEmail.handle({
      from: {
        name: 'Team nuvem connect',
        address: 'nuvem.connect@email.com'
      },
      to: email,
      subject: 'Código para alterar senha',
      html: `
      <!DOCTYPE html>
      <html lang="pt-Br">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz@0,9..40;1,9..40&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'DM Sans', sans-serif; font-weight: 400; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 2rem 0;">
        <div style="max-width: 22.5rem; box-shadow: 0px 4px 100px 0px #0000000D; padding: 0 1.78125rem; text-align: center;">
              <div style="display: flex; justify-content: center; gap: 1rem; align-items: center; margin: 3rem 0 4.625rem 0">
                  <img src="https://raw.githubusercontent.com/WendelSantosNunes/imagem/854c2b7f33bc4c4d59f97cb81cf4ca988048a34a/logo-mobile.svg" alt="Imagem da logo">
                  <h1 style="font-size: 1rem; font-family: 'Poppins', sans-serif; margin: 0; color: #091A36;">NuvemConnect</h1>
              </div>

              <h2 style="font-family: 'Poppins', sans-serif; font-weight: bold; margin: 0 0 1.5625rem 0;">Redefinir senha</h2>

              <p style="margin: 0 0 1.5625rem 0;">Olá, ${account.name}!</p>
              
              <p style="margin: 0 0 2.5rem 0; font-size:  0.875rem">Você solicitou a redefinição de sua senha. Use o código abaixo para completar o processo:</p>

              <p style="font-weight: 700; font-size: 1.25rem; margin: 0 0 2.5rem 0;">${token}</p>

              <p style="font-size: 0.875rem; text-align: center; margin: 0 0 2.5rem 0;">Digite este código na página de redefinição de senha para criar uma nova senha.</p>
              
              <p style="font-size: 0.75rem; text-align: center; color: #6A7686; font-size: 0.875rem; margin: 0 0 9.1875rem 0;">
                  Se você não solicitou essa mudança, por favor, entre em contato com nosso suporte imediatamente.
              </p>

              <p style="font-size: 0.75rem; margin: 0 0 1.375rem 0;">[Política de Privacidade | Termos de Uso]</p>
              
              <p style="font-size: 0.75rem; margin: 0 0 1.75rem 0;">Copyright © 2024, nuvemconnect.com</p>
          </div>
      </body>
      </html>`
    })
    await this.passwordResetToken.savePasswordResetToken(passwordResetToken)

    return {
      tokenUUID: passwordResetToken.uuid,
      token
    }
  }
}
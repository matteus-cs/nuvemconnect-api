import { Account } from '../../domain/entities/account'
import { IAccountRepository } from '../../domain/repositories/account-repository'
import { SendMail } from '../../domain/shared/send-email'
import { UnprocessableEntityError } from '../../domain/utils/error-handle'
import 'dotenv/config'

interface RequestCreateAccount {
  name: string
  email: string
  password: string
  isActive?: boolean | null
}

export class CreateAccountUseCase {
  constructor (
    private accountRepository: IAccountRepository,
    private sendEmail?: SendMail
  ) {}

  async execute ({
    name,
    email,
    password,
    isActive
  }: RequestCreateAccount): Promise<Account> {
    const accountAlreadyExist = await this.accountRepository.findByEmail(email)
    if (accountAlreadyExist) {
      throw new UnprocessableEntityError('Account already exist')
    }

    const account = Account.create(name, email, password, isActive)
    await this.accountRepository.save(account)

    if(this.sendEmail){
      this.sendEmail.handle({
        from: {
          name: 'Team nuvem connect',
          address: 'nuvem.connect@email.com'
        },
        to: email,
        subject: 'Ative sua conta',
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
          <body style="font-family: 'DM Sans', sans-serif; font-weight: 400; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 2rem 0">
            <div style="max-width: 22.5rem; box-shadow: 0px 4px 100px 0px #0000000D; padding: 0 1.78125rem; text-align: center;">
                  <div style="display: flex; justify-content: center; gap: 1rem; align-items: center; margin: 3rem 0 4.375rem 0">
                      <img src="https://raw.githubusercontent.com/WendelSantosNunes/imagem/854c2b7f33bc4c4d59f97cb81cf4ca988048a34a/logo-mobile.svg" alt="Imagem da logo">
                      <h1 style="font-size: 1rem;font-family: 'Poppins', sans-serif; margin: 0; color: #091A36;">NuvemConnect</h1>
                  </div>
  
                  <div style="display: flex; justify-content: center; margin: 0 0 4.0625rem 0;">
                      <h2 style="
                          max-width: 24.75rem; 
                          width: 100%; 
                          font-size: 1.4375rem;
                          font-family: 'Poppins', sans-serif;
                          margin: 0; line-height: 2.125rem;"
                      >
                          Bem vindo ao nuvemconect
                      </h2>
                  </div>
  
                  <h3 style="font-size: 1rem; font-family: 'Poppins', sans-serif; margin: 0 0 2.25rem 0;">Verifique seu endereço de e-mail</h3>
  
                  <p style="font-size: 0.875rem; margin: 0 0 1.875rem 0;">Clique no botão abaixo para confirmar seu endereço de e-mail e ativar sua conta.</p>
                  
                  <div style="background-color: #1D89DA; margin: 0 auto; padding: 1rem 4.5625rem; border-radius: 6.25rem;">
                      <a href= "${process.env.URL_API}/account/activate/${account.uuid}" style="color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 1.125rem;">CONFIRMAR EMAIL</a>
                  </div>
  
                  <p style="color: #6A7686; font-size: 0.875rem; margin: 2.25rem 0 6.75rem 0;">
                      se você recebeu isso por engano, simplesmente ignore este e-mail e não clique no botão.
                  </p>
  
                  <p style="font-size: 0.75rem; text-align: center; margin: 0 0 0.625rem 0;">Copyright © 2024, nuvemconnect.com</p>
                  
                  <p style="font-size: 0.75rem; text-align: center; margin: 0 0 0.625rem 0;">
                      se você não deseja receber esses emails,
                  </p>
  
                  <a href="" style="font-size: 0.75rem; text-align: center; text-decoration: none; margin-bottom: 3.75rem; display: inline-block;">
                      cancele sua inscrição aqui
                  </a>
              </div>
          </body>
          </html>
        `
      })
    }


    return account
  }
}

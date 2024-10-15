import { Email } from '../../domain/entities/email'
import { IAccountRepository } from '../../domain/repositories/account-repository'
import { NotFoundError, UnprocessableEntityError } from '../../domain/utils/error-handle'
import { generateToken, TokenPayload } from '../../infra/lib/jwt'

interface RequestLogin {
  email: string
  password: string
}


export class LoginUseCase {
  constructor (private accountRepository: IAccountRepository) {}

  async execute (request: RequestLogin): Promise<string> {
    const email = new Email(request.email)

    const account = await this.accountRepository.findByEmailPassword(
      email,
      request.password
    )

    if(!account) {
      throw new NotFoundError('Invalid email or password')
    }
    if(!account.isActive) {
      throw new UnprocessableEntityError('Account not activated')
    }

    const tokenPayload: TokenPayload = {
      uuid: account.uuid,
      email: account.email.value
    }

    const token = generateToken(tokenPayload)
    return token
  }
}

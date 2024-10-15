import { Account } from '../../domain/entities/account'
import { IAccountRepository } from '../../domain/repositories/account-repository'
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token-repository'
import { UnprocessableEntityError, NotFoundError } from '../../domain/utils/error-handle'

interface RequestResetPassword {
  token: string
  tokenUUID: string
  email: string
  password: string
}

export class resetPasswordUseCase {
  constructor (
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute (request: RequestResetPassword): Promise<void | Error> {
    const { email, password, tokenUUID, token } = request

    const passwordResetToken = await this.passwordResetTokenRepository.findTokenByUUID(tokenUUID)
    if(!passwordResetToken) {
      throw new NotFoundError('Password reset token not found')
    }
    if(passwordResetToken.token !== token) {
      throw new UnprocessableEntityError('mismatched token')
    }
  
    if(!Account.isValidPassword(password)){
      throw new UnprocessableEntityError('Password does not meet the required criteria')
    }

    await this.accountRepository.updatePassword(email, password)
  }
}

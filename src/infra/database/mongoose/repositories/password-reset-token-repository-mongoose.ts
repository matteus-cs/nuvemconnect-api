import { Email } from '../../../../domain/entities/email'
import { PasswordResetToken, passwordResetTokenStatusType } from '../../../../domain/entities/passwordResetToken'
import { PasswordResetTokenRepository } from '../../../../domain/repositories/password-reset-token-repository'
import { PasswordResetTokenModel } from '../model/password-reset-token-model'


export class PasswordResetTokenRepositoryMongoose implements PasswordResetTokenRepository {
  async findTokenByEmail (accountEmail: string): Promise<PasswordResetToken[]> {
    const resetTokens = await PasswordResetTokenModel.find({ email: accountEmail }).lean()
    return resetTokens.map(resetToken => {
      return PasswordResetToken.reconstitute({
        uuid: <string>resetToken.uuid,
        token: <string>resetToken.token,
        email: new Email(<string>resetToken.email),
        status: <passwordResetTokenStatusType>resetToken.status,
        createdAt: resetToken.createdAt
      })
    }) 
  }
  async count (accountEmail: string): Promise<number> {
    const countPasswordResetToken = await PasswordResetTokenModel.find({ email: accountEmail }).countDocuments().lean()
    return countPasswordResetToken
  }
  async findTokenByUUID (uuid: string): Promise<PasswordResetToken | null> {
    const resetToken = await PasswordResetTokenModel.findOne({ uuid }).lean()
    if(!resetToken) {
      return null
    }
    return PasswordResetToken.reconstitute({
      uuid: <string>resetToken.uuid,
      token: <string>resetToken.token,
      email: new Email(<string>resetToken.email),
      status: <passwordResetTokenStatusType>resetToken.status,
      createdAt: resetToken.createdAt
    })
  }
  
  async savePasswordResetToken (passwordResetToken: PasswordResetToken): Promise<void> {
    await PasswordResetTokenModel.create({
      uuid: passwordResetToken.uuid,
      token: passwordResetToken.token,
      email: passwordResetToken.email.value
    })
  }
  async existToken (accountEmail: string): Promise<boolean> {
    const resetToken = await PasswordResetTokenModel.findOne({ email: accountEmail }).lean()
    if(!resetToken){
      return false
    }

    return true
  }
} 
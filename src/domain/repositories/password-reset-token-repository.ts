import { PasswordResetToken } from '../entities/passwordResetToken'


export interface PasswordResetTokenRepository {
  savePasswordResetToken(passwordResetToken: PasswordResetToken): Promise<void>
  existToken(accountEmail: string): Promise<boolean>
  findTokenByUUID(uuid: string): Promise<PasswordResetToken | null>
  findTokenByEmail(accountEmail: string): Promise<PasswordResetToken[]>
  count(accountEmail: string): Promise<number>
}
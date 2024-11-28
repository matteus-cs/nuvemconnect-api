import { model, Schema } from 'mongoose'
import { PasswordResetToken } from '../../../../domain/entities/passwordResetToken'
import { Replace } from '../../../../domain/utils/replace'

const schema = new Schema({
  uuid: String,
  token: String,
  email: String,
  status: {
    type: String,
    enum: ['active', 'deactivated']
  },
  createdAt: { type: Date, default: Date.now }
})

schema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 })

export const PasswordResetTokenModel = model<Replace<PasswordResetToken, {email: string}>>('PasswordResetToken', schema)

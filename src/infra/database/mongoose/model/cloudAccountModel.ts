import { Schema, model } from 'mongoose'
import { CloudAccountProps } from '../../../../domain/entities/cloudAccount'

export const CloudAccountModel = model<CloudAccountProps>(
  'CloudAccount',
  new Schema({
    uuid: { type: String, required: true },
    userId: { type: String, required: true },
    provider: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  })
)

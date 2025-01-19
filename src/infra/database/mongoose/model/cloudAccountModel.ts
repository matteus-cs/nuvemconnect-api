import { Schema, model } from 'mongoose'
import { CloudAccountProps } from '../../../../domain/entities/cloudAccount'

export const CloudAccountModel = model<CloudAccountProps>(
  'CloudAccount',
  new Schema({
    _id: { type: String, required: true },
    emailAccount: { type: String, required: true },
    emailCloudAccount: { type: String, required: true },
    provider: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  })
)

import { ICloudAccountRepository } from '../../../../domain/repositories/cloudAccount-repository'
import { CloudAccount } from '../../../../domain/entities/cloudAccount'
import { CloudAccountModel } from '../model/cloudAccountModel'

interface UpdateData {
  accessToken: string
  refreshToken?: string
  expiryDate?: Date
}

export class CloudAccountRepositoryMongoose implements ICloudAccountRepository {
  async findByUserIdAndProvider (userId: string, provider: string) {
    const cloudAccount = await CloudAccountModel.findOne({
      userId,
      provider
    }).exec()
    return cloudAccount ? cloudAccount.toObject() : null
  }

  async create (cloudAccount: CloudAccount) {
    const {
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate,
      uuid,
      createdAt
    } = cloudAccount.getProps()
    const newCloudAccount = new CloudAccountModel({
      uuid,
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate,
      createdAt
    })
    await newCloudAccount.save()
  }

  async updateTokens (
    id: string,
    accessToken: string,
    refreshToken?: string,
    expiryDate?: Date
  ) {
    const updateData: UpdateData = { accessToken }
    if (refreshToken) updateData.refreshToken = refreshToken
    if (expiryDate) updateData.expiryDate = expiryDate

    await CloudAccountModel.findByIdAndUpdate(id, updateData, {
      new: true
    }).exec()
  }

  async save (cloudAccount: CloudAccount) {
    const {
      uuid,
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate,
      createdAt
    } = cloudAccount.getProps()

    await CloudAccountModel.findOneAndUpdate(
      { uuid },
      {
        uuid,
        userId,
        provider,
        accessToken,
        refreshToken,
        expiryDate,
        createdAt
      },
      { upsert: true, new: true }
    ).exec()
  }
}

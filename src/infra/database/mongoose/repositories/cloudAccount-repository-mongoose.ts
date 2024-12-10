import { ICloudAccountRepository } from '../../../../domain/repositories/cloudAccount-repository'
import { CloudAccount } from '../../../../domain/entities/cloudAccount'
import { CloudAccountModel } from '../model/cloudAccountModel'

interface UpdateData {
  accessToken: string
  refreshToken?: string
  expiryDate?: Date
}

export class CloudAccountRepositoryMongoose implements ICloudAccountRepository {
  async findByUserEmailAndProvider (userEmail: string, provider: string) {
    const cloudAccount = await CloudAccountModel.findOne({
      userEmail,
      provider
    }).exec()
    return cloudAccount ? cloudAccount.toObject() : null
  }

  async create (cloudAccount: CloudAccount) {
    const {
      _id,
      userEmail,
      provider,
      accessToken,
      expiryDate,
      refreshToken,
      createdAt
    } = cloudAccount.getProps()
    const newCloudAccount = new CloudAccountModel({
      _id,
      userEmail,
      provider,
      accessToken,
      expiryDate,
      refreshToken,
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
      _id,
      userEmail,
      provider,
      accessToken,
      expiryDate,
      refreshToken,
      createdAt
    } = cloudAccount.getProps()

    await CloudAccountModel.findOneAndUpdate(
      { _id },
      {
        _id,
        userEmail,
        provider,
        accessToken,
        expiryDate,
        refreshToken,
        createdAt
      },
      { upsert: true, new: true }
    ).exec()
  }
}

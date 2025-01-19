import { CloudAccount, CloudAccountProps } from '../entities/cloudAccount'

export interface ICloudAccountRepository {
  findByEmailAccountEmailCloudAccountAndProvider(
    emailAccount: string,
    emailCloudAccount: string,
    provider: string
  ): Promise<CloudAccountProps | null>
  create(cloudAccount: CloudAccount): Promise<void>
  updateTokens(
    id: string,
    accessToken: string,
    refreshToken?: string,
    expiryDate?: Date
  ): Promise<void>
}

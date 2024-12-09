import { randomUUID } from 'crypto'
import { Replace } from '../utils/replace'
import { UnprocessableEntityError } from '../utils/error-handle'

export interface CloudAccountProps {
  uuid: string
  userId: string
  provider: string
  accessToken: string
  refreshToken: string
  expiryDate: Date
  createdAt: Date
}

export class CloudAccount {
  private props: CloudAccountProps

  private constructor (
    props: Replace<
      CloudAccountProps,
      { uuid?: string; createdAt?: Date; refreshToken?: string }
    >
  ) {
    this.props = {
      uuid: props.uuid ?? randomUUID(),
      userId: props.userId,
      provider: props.provider,
      accessToken: props.accessToken,
      expiryDate: props.expiryDate,
      refreshToken: props.refreshToken ?? '',
      createdAt: props.createdAt ?? new Date()
    }
  }

  public static create (
    userId: string,
    provider: string,
    accessToken: string,
    expiryDate: Date,
    refreshToken?: string
  ): CloudAccount {
    if (!accessToken) {
      throw new UnprocessableEntityError('Access or Refresh token is missing')
    }
    return new CloudAccount({
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate
    })
  }

  public getProps () {
    return this.props
  }
}

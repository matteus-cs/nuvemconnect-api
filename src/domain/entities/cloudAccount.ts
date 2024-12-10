import { randomUUID } from 'crypto'
import { Replace } from '../utils/replace'
import { UnprocessableEntityError } from '../utils/error-handle'

export interface CloudAccountProps {
  _id: string
  userEmail: string
  provider: string
  accessToken: string
  expiryDate: Date
  refreshToken: string
  createdAt: Date
}

export class CloudAccount {
  private props: CloudAccountProps

  private constructor (
    props: Replace<
      CloudAccountProps,
      { _id?: string; createdAt?: Date; refreshToken?: string }
    >
  ) {
    this.props = {
      _id: props._id ?? randomUUID(),
      userEmail: props.userEmail,
      provider: props.provider,
      accessToken: props.accessToken,
      expiryDate: props.expiryDate,
      refreshToken: props.refreshToken ?? '',
      createdAt: props.createdAt ?? new Date()
    }
  }

  public static create (
    userEmail: string,
    provider: string,
    accessToken: string,
    expiryDate: Date,
    refreshToken?: string
  ): CloudAccount {
    if (!accessToken) {
      throw new UnprocessableEntityError('Access or Refresh token is missing')
    }
    return new CloudAccount({
      userEmail,
      provider,
      accessToken,
      expiryDate,
      refreshToken
    })
  }

  public getProps () {
    return this.props
  }
}

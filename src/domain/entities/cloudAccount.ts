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
    props: Replace<CloudAccountProps, { uuid?: string; createdAt?: Date }>
  ) {
    this.props = {
      uuid: props.uuid ?? randomUUID(),
      userId: props.userId,
      provider: props.provider,
      accessToken: props.accessToken,
      refreshToken: props.refreshToken,
      expiryDate: props.expiryDate,
      createdAt: props.createdAt ?? new Date()
    }
  }

  public static create (
    userId: string,
    provider: string,
    accessToken: string,
    refreshToken: string,
    expiryDate: Date
  ): CloudAccount {
    if (!accessToken || !refreshToken) {
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

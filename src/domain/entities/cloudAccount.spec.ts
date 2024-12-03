import { describe, it, expect } from 'vitest'
import { CloudAccount } from './cloudAccount'
import { UnprocessableEntityError } from '../utils/error-handle'

describe('CloudAccount', () => {
  it('should create a CloudAccount with valid data', () => {
    const userId = 'user123'
    const provider = 'google-drive'
    const accessToken = 'access-token'
    const refreshToken = 'refresh-token'
    const expiryDate = new Date()

    const cloudAccount = CloudAccount.create(
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate
    )

    expect(cloudAccount.getProps().userId).toBe(userId)
    expect(cloudAccount.getProps().provider).toBe(provider)
    expect(cloudAccount.getProps().accessToken).toBe(accessToken)
    expect(cloudAccount.getProps().refreshToken).toBe(refreshToken)
    expect(cloudAccount.getProps().expiryDate).toBe(expiryDate)
    expect(cloudAccount.getProps().createdAt).toBeInstanceOf(Date)
    expect(cloudAccount.getProps().uuid).toBeDefined()
  })

  it('should throw an error if accessToken or refreshToken is missing', () => {
    const userId = 'user123'
    const provider = 'google-drive'
    const accessToken = ''
    const refreshToken = ''
    const expiryDate = new Date()

    expect(() => {
      CloudAccount.create(
        userId,
        provider,
        accessToken,
        refreshToken,
        expiryDate
      )
    }).toThrowError(UnprocessableEntityError)
  })

  it('should use the current date for createdAt if not provided', () => {
    const userId = 'user123'
    const provider = 'google-drive'
    const accessToken = 'access-token'
    const refreshToken = 'refresh-token'
    const expiryDate = new Date()

    const cloudAccount = CloudAccount.create(
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate
    )

    const currentDate = new Date()
    const createdAt = cloudAccount.getProps().createdAt
    expect(createdAt).toBeInstanceOf(Date)
    expect(createdAt.getDate()).toBe(currentDate.getDate())
  })

  it('should generate a new uuid if not provided', () => {
    const userId = 'user123'
    const provider = 'google-drive'
    const accessToken = 'access-token'
    const refreshToken = 'refresh-token'
    const expiryDate = new Date()

    const cloudAccount = CloudAccount.create(
      userId,
      provider,
      accessToken,
      refreshToken,
      expiryDate
    )

    expect(cloudAccount.getProps().uuid).toBeDefined()
  })
})

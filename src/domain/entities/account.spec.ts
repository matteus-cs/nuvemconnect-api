import { describe, expect, it } from 'vitest'
import { Account } from './account'

describe('Account entity', () => {
  it('should be able create an instance of Account with the create method', () => {
    const account = Account.create(
      'Fake name',
      'fake@email.com',
      'F@k3Password'
    )

    expect(account).instanceOf(Account)
  })
  it('should be able create an instance of Account with the reconstitute method', () => {
    const account = Account.reconstitute(
      'Fake name',
      'fake-uuid-93892',
      'fake@email.com',
      'F@k3Password',
      true
    )

    expect(account).instanceOf(Account)
  })
  it('should throw an error for a password without an number', () => {
    expect(() =>
      Account.create('Fake name', 'fake@email.com', 'f@kePassword')
    ).toThrowError()
  })
  it('should throw an error for a password without a capital letter', () => {
    expect(() =>
      Account.create('Fake name', 'fake@email.com', 'f@k3password')
    ).toThrowError()
  })
  it('should throw an error for a password without a lower-case letter', () => {
    expect(() =>
      Account.create('Fake name', 'fake@email.com', 'F@K3PASSWORD')
    ).toThrowError()
  })
  it('should throw an error for passwords without special characters', () => {
    expect(() =>
      Account.create('Fake name', 'fake@email.com', 'fak3Password')
    ).toThrowError()
  })
})

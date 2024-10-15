import { describe, expect, it } from 'vitest'
import { PasswordResetToken } from './passwordResetToken'

describe('PasswordResetToken entity', () => {
  it('should be able create instance of PasswordResetToken', () => {
    const passwordResetToken = PasswordResetToken.create('john@email.com', '123456')

    expect(passwordResetToken).instanceOf(PasswordResetToken)
  })
  it('should throw an error if the token is not exactly 6 characters long and is alphanumeric', () => {
    expect(() => {
      PasswordResetToken.create('john@email.com', '1e3f5P')
    }).toThrowError()

    expect(() => {
      PasswordResetToken.create('john@email.com', '12345')
    }).toThrowError()

    expect(() => {
      PasswordResetToken.create('john@email.com', '1234567')
    }).toThrowError()
  })
})

// test/use-cases/reset-password-use-case.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryAccountRepository } from '../../../test/repositories/in-memory-account-repository'
import { resetPasswordUseCase } from '../../use-cases/user/reset-password-use-case'
import { Account } from '../../domain/entities/account'
import { InMemoryPasswordResetTokenRepository } from '../../../test/repositories/in-memory-password-reset--token-repository'
import { PasswordResetToken } from '../../domain/entities/passwordResetToken'

describe('Reset Password Use Case', () => {
  let accountRepository: InMemoryAccountRepository
  let resetPassword: resetPasswordUseCase
  let passwordResetTokenRepository: InMemoryPasswordResetTokenRepository
  let passwordResetToken: PasswordResetToken

  beforeEach(() => {
    passwordResetTokenRepository = new InMemoryPasswordResetTokenRepository()
    accountRepository = new InMemoryAccountRepository()
    resetPassword = new resetPasswordUseCase(passwordResetTokenRepository, accountRepository)
    passwordResetToken = PasswordResetToken.create('fake@email.com', '938746')
    passwordResetTokenRepository.passwordResetTokens.push(passwordResetToken)
  })

  it('should reset the password if the account exists and password is valid', async () => {
    const account = Account.create('Fake Name', 'fake@email.com', 'OldP@ssw0rd')
    accountRepository.accounts.push(account)

    await resetPassword.execute({
      tokenUUID: passwordResetToken.uuid,
      token: '938746',
      email: 'fake@email.com',
      password: 'NewP@ssw0rd1!'
    })

    expect(accountRepository.accounts[0].password).toBe('NewP@ssw0rd1!')
  })

  it('should throw an error if the password reset token not found', async () => {
    await expect(() => {
      return resetPassword.execute({
        tokenUUID: 'fake-uuid2',
        token: '93h87c',
        email: 'fake@email.com',
        password: 'invalid'
      })
    }
    ).rejects.toThrowError(/^Password reset token not found$/)
  })

  it('should throw an error if token mismatched', async () => {
    await expect(() => {
      return resetPassword.execute({
        tokenUUID: passwordResetToken.uuid,
        token: '08h27d',
        email: 'fake@email.com',
        password: 'invalid'
      })
    }
    ).rejects.toThrowError(/^mismatched token$/)
  })

  it('should throw an error if the password is invalid', async () => {
    const account = Account.create('Fake Name', 'fake@email.com', 'OldP@ssw0rd')
    accountRepository.accounts.push(account)

    await expect(() => {
      return resetPassword.execute({
        tokenUUID: passwordResetToken.uuid,
        token: '938746',
        email: 'fake@email.com',
        password: 'invalid'
      })
    }
    ).rejects.toThrowError(/^Password does not meet the required criteria$/)
  })
})
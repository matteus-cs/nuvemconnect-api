import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InMemoryAccountRepository } from '../../../test/repositories/in-memory-account-repository'
import { LoginUseCase } from './login-use-case'
import { Account } from '../../domain/entities/account'
import { Email } from '../../domain/entities/email'
import * as utils from '../../infra/lib/jwt'

describe('LoginUseCase', () => {
  let accountRepository: InMemoryAccountRepository
  let loginUseCase: LoginUseCase

  beforeEach(() => {
    accountRepository = new InMemoryAccountRepository()
    loginUseCase = new LoginUseCase(accountRepository)
  })

  it('should return a token if email and password are correct', async () => {
    const name = 'Teste name'
    const email = new Email('test@example.com')
    const password = 'securePassword1!'


    const mockGenerateToken = vi.spyOn(utils, 'generateToken').mockResolvedValue('valid-token')

    const account = Account.create(name, email.value, password, true)
    await accountRepository.save(account)



    const token = await loginUseCase.execute({ email: email.value, password })
    expect(mockGenerateToken).toHaveBeenLastCalledWith({ uuid: account.uuid, email: email.value })
    expect(token).toBe('valid-token')
  })

  it('should throw an error if email or password is incorrect', async () => {
    const name = 'Teste name'
    const email = new Email('test@example.com')
    const password = 'securePassword1!'
    const wrongPassword = 'wrongPassword'

    const account = Account.create(name, email.value, password)
    await accountRepository.save(account)

    await expect(
      loginUseCase.execute({ email: email.value, password: wrongPassword })
    ).rejects.toThrowError('Invalid email or password')

    await expect(
      loginUseCase.execute({ email: 'wrong@example.com', password })
    ).rejects.toThrowError('Invalid email or password')
  })

  it('should throw an error if password is empty', async () => {
    const name = 'Teste name'
    const email = new Email('test@example.com')
    const password = 'securePassword1!'
    const account = Account.create(name, email.value, password)
    await accountRepository.save(account)

    await expect(
      loginUseCase.execute({ email: email.value, password: '' })
    ).rejects.toThrowError('Invalid email or password')
  })

  it('should throw an error if email is empty', async () => {
    const name = 'Teste name'
    const email = new Email('test@example.com')
    const password = 'securePassword1!'
    const account = Account.create(name, email.value, password)
    await accountRepository.save(account)

    await expect(
      loginUseCase.execute({ email: '', password: password })
    ).rejects.toThrowError('Invalid email')
  })
})

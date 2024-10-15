import { describe, it, expect } from 'vitest'
import { InMemoryAccountRepository } from '../../../test/repositories/in-memory-account-repository'
import { CreateAccountUseCase } from './create-account-use-cases'
import { Account } from '../../domain/entities/account'
import { dataType, SendMail } from '../../domain/shared/send-email'

describe('Create account use case', () => {

  const sendEmail: SendMail = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handle: async function (data: dataType): Promise<void> {
      
    }
  }

  it('should be able create a account', async () => {
    const accountRepository = new InMemoryAccountRepository()
    const createAccountUseCase = new CreateAccountUseCase(accountRepository, sendEmail)
    const account = await createAccountUseCase.execute({
      name: 'Fake name',
      email: 'fake@email.com',
      password: 'f@k3Password'
    })

    expect(account).toBeInstanceOf(Account)
    expect(accountRepository.accounts).toHaveLength(1)
    expect(accountRepository.accounts[0]).toEqual(account)
  })

  it('should to throw error if the email already registered', async () => {
    const accountRepository = new InMemoryAccountRepository()
    const createAccountUseCase = new CreateAccountUseCase(accountRepository, sendEmail)
    await createAccountUseCase.execute({
      name: 'Fake name',
      email: 'fake@email.com',
      password: 'f@k3Password'
    })

    expect(() =>
      createAccountUseCase.execute({
        name: 'Fake name',
        email: 'fake@email.com',
        password: 'f@k3Password'
      })
    ).rejects.toThrowError()
  })
})

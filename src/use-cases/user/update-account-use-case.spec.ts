import { describe, it, expect } from 'vitest'
import { UpdateAccountUseCase } from './update-account-use-case'
import { InMemoryAccountRepository } from '../../../test/repositories/in-memory-account-repository'
import { Account } from '../../domain/entities/account'


describe('update account use case', () => {
  it('should be able update account', async () => {
    const accountRepository = new InMemoryAccountRepository()
    const account = Account.create('john doe', 'john@email.com', '@Pw12345')
    accountRepository.accounts.push(account)
    const updateAccountUseCase = new UpdateAccountUseCase(accountRepository)
    await updateAccountUseCase.execute(account.uuid, { name: 'John II', isActive: true })
    const accountUpdated = accountRepository.accounts[0]

    expect(accountUpdated.name).toBe('John II')
    expect(accountUpdated.isActive).toBeTruthy()
  })

  it('should throw an error if data past in request', async () => {
    const accountRepository = new InMemoryAccountRepository()
    const updateAccountUseCase = new UpdateAccountUseCase(accountRepository)

    await expect(() => {
      return updateAccountUseCase.execute('fake-uuid', {})
    }).rejects.toThrow()
  })
})
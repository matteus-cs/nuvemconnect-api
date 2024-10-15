import { Email } from '../../src/domain/entities/email'
import { Account } from '../../src/domain/entities/account'
import { IAccountRepository, updateAccountType } from '../../src/domain/repositories/account-repository'


export class InMemoryAccountRepository implements IAccountRepository {
  public accounts: Account[] = []
  async save (account: Account): Promise<void> {
    this.accounts.push(account)
  }
  async findByEmail (email: string): Promise<Account | null> {
    const account = this.accounts.find(account => account.email.value === email)
    
    if (!account) {
      return null
    }

    return account
  }

  async findByEmailPassword (
    email: Email,
    password: string
  ): Promise<Account | null> {
    const account = this.accounts.find(
      acc => acc.email.value === email.value && acc.password === password
    )

    if (!account) {
      return null
    }
    return account
  }
  
  async updatePassword (email: string, password: string): Promise<void> {
    const account = this.accounts.find(account => account.email.value === email)
    
    if (!account) {
      throw new Error('Account not found')
    }
    
    account.password = password
  }
  async update (uuid: string, accountProps: updateAccountType): Promise<void> {
    const account = this.accounts.find((account) => {
      return account.uuid === uuid
    })

    if (!account) {
      throw new Error('Account not found')
    }
   
    Object.keys(accountProps).forEach((key) => {
      if(key in account && key !== 'uuid') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (account as any)[key] = accountProps[key as keyof updateAccountType]
      }
    })
  }
}

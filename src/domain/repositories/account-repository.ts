import type { Email } from '../entities/email'
import type { Account, AccountProps } from '../entities/account'

export type updateAccountType = Partial<Omit<AccountProps, 'uuid'>>

export interface IAccountRepository {
  save(account: Account): Promise<void>
  findByEmail(email: string): Promise<Account | null>
  findByEmailPassword(email: Email, password: string): Promise<Account | null>
  updatePassword(email: string, password: string): Promise<void>
  update(uuid: string, accountProps: updateAccountType): Promise<void>
}

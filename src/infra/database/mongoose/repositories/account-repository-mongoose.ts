import { Email } from '../../../../domain/entities/email'
import { Account } from '../../../../domain/entities/account'
import { IAccountRepository, updateAccountType } from '../../../../domain/repositories/account-repository'
import { hashPassword, comparePassword } from '../../../lib/bcrypt'
import { accountModel } from '../model/account-model'


export class AccountRepositoryMongoose implements IAccountRepository {
  async save (account: Account): Promise<void> {
    const hashedPassword = hashPassword(account.password)
    const acc = new accountModel({
      uuid: account.uuid,
      name: account.name,
      email: account.email.value,
      password: hashedPassword,
      isActive: account.isActive
    })
    acc.save()
  }
  async findByEmail (email: string): Promise<Account | null> {
    const data = await accountModel.findOne({ email })

    if (!data) {
      return null
    }
    const acc = Account.reconstitute(
      data.uuid,
      data.name,
      data.email,
      data.password,
      data.isActive
    )
    return acc
  }

  async findByEmailPassword (
    email: Email,
    password: string
  ): Promise<Account | null> {
    const data = await accountModel.findOne({ email: email.value })
    if (!data) {
      return null
    }

    const isPasswordValid = await comparePassword(password, data.password)
    if (!isPasswordValid) {
      return null
    }

    const acc = Account.reconstitute(
      data.uuid,
      data.name,
      data.email,
      data.password,
      data.isActive
    )
    return acc
    
  }

  async updatePassword (email: string, password: string): Promise<void> {
    const hashedPassword = hashPassword(password)
    await accountModel.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    )
  }
  async update (uuid: string, accountProps: updateAccountType): Promise<void> {
    if('password' in accountProps){
      const hashedPassword = hashPassword(accountProps.password as string)
      await accountModel.updateOne(
        { uuid },
        { $set: { ...accountProps, password: hashedPassword } }
      )
    }
    await accountModel.updateOne(
      { uuid },
      { $set: { ...accountProps } }
    )

  }
}

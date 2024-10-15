import { AccountProps } from '../../domain/entities/account'
import { IAccountRepository } from '../../domain/repositories/account-repository'
import { UnprocessableEntityError } from '../../domain/utils/error-handle'


export type updateAccountType = Partial<Omit<AccountProps, 'uuid'>>

export class UpdateAccountUseCase {
  constructor (private accountRepository: IAccountRepository) {}

  async execute (uuid: string, request: updateAccountType): Promise<void> {
    if(Object.keys(request).length === 0){
      throw new UnprocessableEntityError('no data to update')
    }

    await this.accountRepository.update(uuid, { ...request })
  }
}
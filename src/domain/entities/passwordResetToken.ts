import { randomUUID } from 'crypto'
import { UnprocessableEntityError } from '../utils/error-handle'
import { Email } from './email'

export type passwordResetTokenStatusType = 'active' | 'deactivated'
export interface PasswordResetTokenProps {
  uuid: string,
  email: Email,
  token: string
  status: passwordResetTokenStatusType
  createdAt: Date
}

export class PasswordResetToken {

  private props: PasswordResetTokenProps 
  private constructor (props: PasswordResetTokenProps){
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date()
    }
  }
  static create (email: string, token: string) {

    /* if(token.length !== 6){
      throw new UnprocessableEntityError('token invalid')
    } */
    if(!PasswordResetToken.isValidToken(token)){
      throw new UnprocessableEntityError('token invalid')
    }
    
    return new PasswordResetToken({
      uuid: randomUUID(),
      email: new Email(email),
      token,
      status: 'active',
      createdAt: new Date()
    })
  }

  static isValidToken (token: string): boolean {
    const regex = /^(?=.*[0-9])[0-9]{6}$/
    return regex.test(token)
  }

  static reconstitute (props: PasswordResetTokenProps) {
    return new PasswordResetToken(props)
  }

  get uuid (): string {
    return this.props.uuid
  }
  get token (): string {
    return this.props.token
  }
  get status (): string {
    return this.props.status
  }
  
  set status (status: passwordResetTokenStatusType) {
    this.props.status = status
  }
  get email (): Email {
    return this.props.email
  }

  get createdAt (): Date {
    return this.props.createdAt
  }
}
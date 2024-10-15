import { randomUUID } from 'crypto'
import { Replace } from '../utils/replace'
import { Email } from './email'
import { UnprocessableEntityError } from '../utils/error-handle'

export interface AccountProps {
  uuid: string
  name: string
  email: Email
  password: string
  token?: string
  isActive: boolean
}
export class Account {
  private props: AccountProps
  private constructor (props: Replace<AccountProps, { uuid?: string }>) {
    this.props = {
      uuid: props.uuid ?? randomUUID(),
      name: props.name,
      email: props.email,
      password: props.password,
      token: props.token,
      isActive: props.isActive
    }
  }

  public static create (name: string, email: string, password: string, isActive?: boolean | null): Account {
    if (!Account.isValidPassword(password))
      throw new UnprocessableEntityError('Password does not meet the required criteria')
    return new Account({ name, email: new Email(email), password, isActive: isActive ?? false })
  }

  public static reconstitute (
    uuid: string,
    name: string,
    email: string,
    password: string,
    isActive: boolean
  ) {
    return new Account({ uuid, name, email: new Email(email), password, isActive })
  }

  static isValidPassword (password: string) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    return passwordRegex.test(password)
  }

  get uuid () {
    return this.props.uuid
  }

  get name () {
    return this.props.name
  }

  set name (name: string) {
    this.props.name = name
  }

  get email () {
    return this.props.email
  }

  set email (email: Email) {
    this.props.email = email
  }

  get password () {
    return this.props.password
  }

  set password (password: string) {
    if (!Account.isValidPassword(password))
      throw new UnprocessableEntityError('Password does not meet the required criteria')
    this.props.password = password
  }

  get token () {
    return this.props.token ?? ''
  }

  set token (token: string) {
    this.props.token = token
  }

  get isActive (): boolean {
    return this.props.isActive
  }
  
  set isActive (isActive: boolean) {
    this.props.isActive = isActive
  }
}

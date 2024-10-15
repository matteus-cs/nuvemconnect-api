import { UnprocessableEntityError } from '../utils/error-handle'

export class Email {
  private readonly email: string
   
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  constructor (email: string) {
    if(!this.emailRegex.test(email)){
      throw new UnprocessableEntityError('Invalid email')
    }
    this.email = email
  }

  get value () {
    return this.email
  }
}
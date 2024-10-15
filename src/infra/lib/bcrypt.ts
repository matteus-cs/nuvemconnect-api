import bcrypt from 'bcrypt'
import { genSaltSync, hashSync } from 'bcrypt'

function hashPassword (password: string) {
  const salt = genSaltSync(10)

  return hashSync(password, salt)
}

function comparePassword (providedPassword: string, storedPassword: string) {
  return bcrypt.compare(providedPassword, storedPassword)
}

export { hashPassword, comparePassword }

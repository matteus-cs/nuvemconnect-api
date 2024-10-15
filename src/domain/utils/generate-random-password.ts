export async function generateRandomPassword (length: number = 12): Promise<string> {
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const specialChars = '!@#$%^&*'

  // Garantir que a senha contém pelo menos um de cada tipo de caractere
  const password = [
    lowerCase[Math.floor(Math.random() * lowerCase.length)],
    upperCase[Math.floor(Math.random() * upperCase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)]
  ]

  // Preencher o restante da senha com caracteres aleatórios
  const allChars = lowerCase + upperCase + digits + specialChars
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)])
  }

  // Embaralhar a senha
  return password.sort(() => 0.5 - Math.random()).join('')
}

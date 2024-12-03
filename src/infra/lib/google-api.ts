import { google } from 'googleapis'
import 'dotenv/config'

interface GoogleUser {
  email: string
}

export const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET_KEY,
  redirectUri: process.env.GOOGLE_REDIRECT_URL
})

// Função para obter as informações do usuário
export async function getUserInfo (accessToken: string, refreshToken: string) {
  try {
    // Definir o token de acesso no cliente OAuth2
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    // Inicializar a API de OAuth2
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    })

    // Fazer uma requisição para obter as informações do perfil do usuário
    const { data } = await oauth2.userinfo.get()

    return data
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error)
    throw error
  }
}

export async function getAccountCloudInfo (code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens || !tokens.access_token || !tokens.refresh_token) {
      throw new Error('Invalid Google tokens')
    }

    oauth2Client.setCredentials(tokens)
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const response = await drive.about.get({ fields: 'user' })
    const userInfo = response.data.user as GoogleUser
    if (!response.data.user || !userInfo.email) {
      throw new Error('User info or email is not available')
    }

    return {
      tokens,
      userEmail: userInfo.email
    }
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error)
    throw error
  }
}

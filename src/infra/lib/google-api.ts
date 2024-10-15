import { google } from 'googleapis'
import 'dotenv/config'

export const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET_KEY,
  redirectUri: process.env.GOOGLE_REDIRECT_URL
})


// Função para obter as informações do usuário
export async function getUserInfo (accessToken: string, refreshToken: string) {
  try {
    // Definir o token de acesso no cliente OAuth2
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })

    // Inicializar a API de OAuth2
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    })

    // Fazer uma requisição para obter as informações do perfil do usuário
    const { data } = await oauth2.userinfo.get()

    return data
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error)
    throw error
  }
}
import { google, drive_v3 } from 'googleapis'
import { GaxiosResponse } from 'gaxios'
import 'dotenv/config'
import { googleEnv } from '../config/env'

interface GoogleUser {
  emailAddress: string
}

export const oauth2ClientDrive = new google.auth.OAuth2({
  clientId: googleEnv.CLIENT_ID,
  clientSecret: googleEnv.CLIENT_SECRET_KEY,
  redirectUri: googleEnv.GOOGLE_REDIRECT_URL_DRIVE
})

export const oauth2Client = new google.auth.OAuth2({
  clientId: googleEnv.CLIENT_ID,
  clientSecret: googleEnv.CLIENT_SECRET_KEY,
  redirectUri: googleEnv.GOOGLE_REDIRECT_URL
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
    const { tokens } = await oauth2ClientDrive.getToken(code)
    if (!tokens || !tokens.access_token) {
      throw new Error('Tokens do Google inválidos.')
    }

    oauth2ClientDrive.setCredentials(tokens)
    const drive = google.drive({ version: 'v3', auth: oauth2ClientDrive })
    const response = await drive.about.get({ fields: 'user' })
    const userInfo = response.data.user as GoogleUser
    if (!response.data.user || !userInfo.emailAddress) {
      throw new Error('Informações do usuário ou e-mail não estão disponíveis.')
    }

    return {
      tokens,
      userEmail: userInfo.emailAddress
    }
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error)
    throw error
  }
}

export async function manageOauthTokens (
  accessToken: string,
  refreshToken: string
) {
  oauth2ClientDrive.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  })

  /* const tokenIsValid =
    oauth2ClientDrive.credentials.expiry_date &&
    oauth2ClientDrive.credentials.expiry_date > Date.now()

  if (!tokenIsValid) {
    console.log('Token expired. Trying to refresh...')

    await oauth2ClientDrive.refreshAccessToken()
    const { credentials } = await oauth2ClientDrive.refreshAccessToken()

    const newExpiryDate = credentials.expiry_date
      ? new Date(Date.now() + credentials.expiry_date * 1000)
      : new Date()

    return { credentials, newExpiryDate }
  } */
}

export async function listFiles (pageSize?: number, orderBy?: string, nextPageToken?: string ) {
  const drive = google.drive({ version: 'v3', auth: oauth2ClientDrive })

  let allFiles: drive_v3.Schema$File[] = []
  const response: GaxiosResponse<drive_v3.Schema$FileList> =
    await drive.files.list({
      pageSize: pageSize ?? 10,
      orderBy,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageToken: nextPageToken
    })

  const files = response.data.files || []
  allFiles = allFiles.concat(files)
  return { files: allFiles, nextPageToken: response.data.nextPageToken ?? null }
}

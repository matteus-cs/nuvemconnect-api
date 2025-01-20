/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from 'vitest'

describe('Environment Variables Tests', () => {
  let mailEnv: any
  let googleEnv: any
  let JWT_SECRET_KEY: any
  let bdEnv: any
  let urlsEnv: any
    
  beforeEach(async () => {
    process.env.MAIL_HOST = 'smtp.example.com'
    process.env.MAIL_PORT = '587'
    process.env.MAIL_USER = 'user@example.com'
    process.env.MAIL_PASS = 'securepassword'
    process.env.CLIENT_ID = 'google-client-id'
    process.env.CLIENT_SECRET_KEY = 'google-secret'
    process.env.GOOGLE_REDIRECT_URL = 'https://example.com/redirect'
    process.env.GOOGLE_REDIRECT_URL_DRIVE = 'https://example.com/drive-redirect'
    process.env.JWT_SECRET_KEY = 'supersecretkey'
    process.env.CONNECT_STRING_EXTERNAL_MONGODB = 'mongodb://external-db:27017'
    process.env.CONNECT_STRING_INTERNAL_MONGODB = 'mongodb://internal-db:27017'
    process.env.URL_API = 'https://api.example.com'
    process.env.URL_FRONTEND = 'https://frontend.example.com'
    
       
    const envModule = await import('./env')
    mailEnv = envModule.mailEnv
    googleEnv = envModule.googleEnv
    JWT_SECRET_KEY = envModule.JWT_SECRET_KEY
    bdEnv = envModule.bdEnv
    urlsEnv = envModule.urlsEnv
  })
    
  it('should load and validate mail environment variables', () => {
    expect(mailEnv).toEqual({
      HOST: 'smtp.example.com',
      PORT: 587,
      USER: 'user@example.com',
      PASS: 'securepassword',
    })
  })
    
  it('should load and validate Google environment variables', () => {
    expect(googleEnv).toEqual({
      CLIENT_ID: 'google-client-id',
      CLIENT_SECRET_KEY: 'google-secret',
      GOOGLE_REDIRECT_URL: 'https://example.com/redirect',
      GOOGLE_REDIRECT_URL_DRIVE: 'https://example.com/drive-redirect',
    })
  })
    
  it('should load and validate JWT secret key', () => {
    expect(JWT_SECRET_KEY).toEqual('supersecretkey')
  })
    
  it('should load and validate database connection strings', () => {
    expect(bdEnv).toEqual({
      CONNECT_STRING_EXTERNAL_MONGODB: 'mongodb://external-db:27017',
      CONNECT_STRING_INTERNAL_MONGODB: 'mongodb://internal-db:27017',
    })
  })
    
  it('should load and validate API and frontend URLs', () => {
    expect(urlsEnv).toEqual({
      URL_API: 'https://api.example.com',
      URL_FRONTEND: 'https://frontend.example.com',
    })
  })
})
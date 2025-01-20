 
import { describe, it, expect } from 'vitest'

import {
  bdEnvSchema,
  googleEnvSchema,
  jwtEnvSchema,
  mailEnvSchema,
  urlsEnvSchema,
} from './env'

describe('Mail Environment Schema', () => {
  it('should parse valid mail environment variables', () => {
    const env = {
      HOST: 'smtp.example.com',
      PORT: '587',
      USER: 'user@example.com',
      PASS: 'securepassword',
    }
    expect(mailEnvSchema.parse(env)).toEqual({
      HOST: 'smtp.example.com',
      PORT: 587,
      USER: 'user@example.com',
      PASS: 'securepassword',
    })
  })

  it('should throw error for invalid PORT', () => {
    const env = {
      HOST: 'smtp.example.com',
      PORT: 'not-a-number',
      USER: 'user@example.com',
      PASS: 'securepassword',
    }
    expect(() => mailEnvSchema.parse(env)).toThrow()
  })
})

describe('Google Environment Schema', () => {
  it('should parse valid Google environment variables', () => {
    const env = {
      CLIENT_ID: 'google-client-id',
      CLIENT_SECRET_KEY: 'google-secret',
      GOOGLE_REDIRECT_URL: 'https://example.com/redirect',
      GOOGLE_REDIRECT_URL_DRIVE: 'https://example.com/drive-redirect',
    }
    expect(googleEnvSchema.parse(env)).toEqual(env)
  })
  
  it('should throw error for missing CLIENT_ID', () => {
    const env = {
      CLIENT_SECRET_KEY: 'google-secret',
      GOOGLE_REDIRECT_URL: 'https://example.com/redirect',
      GOOGLE_REDIRECT_URL_DRIVE: 'https://example.com/drive-redirect',
    }
    expect(() => googleEnvSchema.parse(env)).toThrow()
  })
})
  
describe('JWT Environment Schema', () => {
  it('should parse valid JWT secret key', () => {
    const secretKey = 'supersecretkey'
    expect(jwtEnvSchema.parse(secretKey)).toEqual(secretKey)
  })
  
  it('should throw error for empty JWT secret key', () => {
    const secretKey = ''
    expect(() => jwtEnvSchema.parse(secretKey)).toThrow()
  })
})
  
describe('Database Environment Schema', () => {
  it('should parse valid database connection strings', () => {
    const env = {
      CONNECT_STRING_EXTERNAL_MONGODB: 'mongodb://external-db:27017',
      CONNECT_STRING_INTERNAL_MONGODB: 'mongodb://internal-db:27017',
    }
    expect(bdEnvSchema.parse(env)).toEqual(env)
  })
  
  it('should throw error for missing CONNECT_STRING_INTERNAL_MONGODB', () => {
    const env = {
      CONNECT_STRING_EXTERNAL_MONGODB: 'mongodb://external-db:27017',
    }
    expect(() => bdEnvSchema.parse(env)).toThrow()
  })
})
  
describe('URLs Environment Schema', () => {
  it('should parse valid API and frontend URLs', () => {
    const env = {
      URL_API: 'https://api.example.com',
      URL_FRONTEND: 'https://frontend.example.com',
    }
    expect(urlsEnvSchema.parse(env)).toEqual(env)
  })
  
  it('should throw error for missing URL_API', () => {
    const env = {
  
  
      URL_FRONTEND: 'https://frontend.example.com',
    }
    expect(() => urlsEnvSchema.parse(env)).toThrow()
  })
})
import { connect } from 'mongoose'
import 'dotenv/config'
import { bdEnv } from '../../config/env'


export async function makeConnection () {
  if(process.env.NODE_ENV === 'production'){
    await connect(bdEnv.CONNECT_STRING_INTERNAL_MONGODB)
  } else {
    await connect(bdEnv.CONNECT_STRING_EXTERNAL_MONGODB)
  }
}
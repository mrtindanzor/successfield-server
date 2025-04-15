import { env } from './src/core.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import successfield_router from './src/successfield/Views/sucessfieldroute.js'

const server = express()
const PORT = process.env.PORT || 8000

server.set({ urlEncoded: true })
server.use(cors({
  origin: env.PROD_ENV === 'PROD' ? env.lIVE_FRONTEND_SERVER : env.FRONTEND_SERVER,
  credentials: true
}))
server.use(cookieParser(env.COOKIE_SECRET_KEY))
server.use(express.json({ limit: '20mb' }))
server.use('/successfield', successfield_router)

server.listen(PORT, function() { console.log('Server running on port', PORT)})
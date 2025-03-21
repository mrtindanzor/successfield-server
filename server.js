import { env } from './core.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import router from './routers.js'

const server = express()
const PORT = env.PORT

server.set({ urlEncoded: true })
server.use(cors({
  origin: env.FRONTEND_SERVER,
  credentials: true
}))
server.use(cookieParser(env.COOKIE_SECRET_KEY))
server.use(express.json())
server.use(router)

server.listen(PORT, function() { console.log('Server running on port', PORT)})
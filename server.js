const { env } = require('./core.js');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const express = require('express')
const routers = require('./routers')
const server = express()
const PORT = env.PORT

server.set({ urlEncoded: true })
server.use(cors({
  origin: env.FRONTEND_SERVER,
  credentials: true
}))
server.use(cookieParser(env.COOKIE_SECRET_KEY))
server.use(express.json())
server.use(routers)

server.listen(PORT, function() { console.log('Server running on port', PORT)})
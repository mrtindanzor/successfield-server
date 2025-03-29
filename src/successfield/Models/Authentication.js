import { Router } from 'express'
import { loginController, registerController, refreshController } from './../Controllers/authentication_controller.js'

const authentication = Router()

authentication.put('/users/register', registerController)

authentication.post('/users/login', loginController)

authentication.post('/users/newToken', refreshController)

export default authentication
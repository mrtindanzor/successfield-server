import { Router } from 'express'
import uploadFields from './../uploads/registrationSettings.js'
import { loginController, registerController, refreshController } from './../Controllers/authentication_controller.js'

const authentication = Router()

authentication.put('/users/register', uploadFields, registerController)

authentication.post('/users/login', loginController)

authentication.post('/users/newToken', refreshController)

export default authentication
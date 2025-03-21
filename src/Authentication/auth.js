import { Router } from 'express'
import { loginController, registerController, refreshController } from './../Controller/authController.js'

const auth = Router()

auth.put('/users/register', registerController)

auth.post('/users/login', loginController)

auth.post('/users/newToken', refreshController)

export default auth
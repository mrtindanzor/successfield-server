import { Router } from 'express'
import uploadFields from './../uploads/registrationSettings.js'
import { 
  loginController, registerController, refreshController, getUserPicture, change_password, change_email, change_phone, change_name
} from './../Controllers/authentication_controller.js'

const authentication = Router()

authentication.put('/users/register', registerController)

authentication.post('/users/login', loginController)

authentication.post('/users/newToken', refreshController)

authentication.post('/users/user', getUserPicture)

authentication.post('/users/changePassword', change_password)

authentication.post('/users/changeName', change_name)

authentication.post('/users/changeEmail', change_email)

authentication.post('/users/changePhone', change_phone)

export default authentication
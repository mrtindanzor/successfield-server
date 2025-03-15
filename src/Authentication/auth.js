const auth = require('express').Router()
const { loginController, registerController, refreshController } = require('./../Controller/authController')

auth.put('/users/register', registerController)

auth.post('/users/login', loginController)

auth.post('/users/newToken', refreshController)

module.exports = auth
import { Router } from 'express'
import verify_controller from './../Controllers/certificate_controller.js'

const certificate = Router()

certificate.post('/verify-certificate', verify_controller)

export default certificate
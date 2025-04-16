import { Router } from 'express'
import verify_controller, { certificate_operations } from './../Controllers/certificate_controller.js'

const certificate = Router()

certificate.post('/verify-certificate', verify_controller)
certificate.patch('/certificate', certificate_operations)

export default certificate
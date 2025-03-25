import { Router } from 'express'
import verify_controller from '../Controller/certificate.js'

const verify_certificate_route = Router()

verify_certificate_route.post('/verify-certificate', verify_controller)

export default verify_certificate_route
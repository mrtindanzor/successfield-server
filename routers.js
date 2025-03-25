import { Router } from 'express'
import auth from './src/Authentication/auth.js'
import verify_certificate_route from './src/VerifyCertificate/Verify.js'
import { getCourses } from './src/Controller/getCourse.js'

const router = Router()

router.use(auth)
router.use(verify_certificate_route)
router.post('/courses', getCourses)

export default router
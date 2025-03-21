import { Router } from 'express'
import auth from './src/Authentication/auth.js'
import { getCourses } from './src/Controller/getCourse.js'

const router = Router()

router.use(auth)
router.post('/courses', getCourses)

export default router
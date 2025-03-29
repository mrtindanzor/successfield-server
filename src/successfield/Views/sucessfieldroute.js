import { Router } from 'express'
import authentication from '../Models/Authentication.js'
import verify_certificate from '../Models/Verify.js'
import courses_route from '../Models/Courses.js'

const successfield_router = Router()

successfield_router.use(authentication)
successfield_router.use(verify_certificate)
successfield_router.use(courses_route)

export default successfield_router
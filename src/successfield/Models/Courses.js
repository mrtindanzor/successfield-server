import { Router } from 'express'
import courses_controller from './../Controllers/courses_controller.js'

const courses_route = Router()

courses_route.post('/courses', courses_controller)

export default courses_route
import { Router } from 'express'
import courses_controller, { create_courses } from './../Controllers/courses_controller.js'

const courses_route = Router()

courses_route.post('/courses', courses_controller)
courses_route.put('/courses', create_courses)

export default courses_route
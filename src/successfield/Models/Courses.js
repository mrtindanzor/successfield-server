import { Router } from 'express'
import courses_controller, { modules_operations_controller, courses_operations_controller, create_courses } from './../Controllers/courses_controller.js'

const courses_route = Router()

courses_route.post('/courses', courses_controller)
courses_route.patch('/courses', courses_operations_controller)
courses_route.patch('/modules', modules_operations_controller)

export default courses_route
import { courseModel, env } from './../../core.js'
import jsonwebtoken from 'jsonwebtoken'

export default async function courses_controller(_, res){
  const fetchedCourses = await courseModel.find({ })
  const courses = jsonwebtoken.sign({ ...fetchedCourses }, env.ACCESS_TOKEN_SECRET )
  return res.json({ courses })
}
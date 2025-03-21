import { courseModel, env } from './../../core.js'
import coursesDb from './../db/coursesDb.js'
const Courses = env.PROD_ENV === 'PROD' ? await courseModel.find({ }) : coursesDb


export async function getCourses(_, res){
  return res.json({ courses: Courses })
}
import { courseModel } from './../../core.js'

export default async function courses_controller(_, res){
  const courses = await courseModel.find({ })
  return res.json({ courses })
}
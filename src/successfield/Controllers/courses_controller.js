import { courseModel, coursesModel, modulesModel, benefitsModel, outlinesModel, objectivesModel, env } from './../../core.js'
import jsonwebtoken from 'jsonwebtoken'

export default async function courses_controller(_, res){
  const courses = await coursesModel.find({ })
  const fetchedModules = await modulesModel.find({  })
  const benefits = await benefitsModel.find({  })
  const objectives = await objectivesModel.find({  })
  const outlines = await outlinesModel.find({  })

  let modules = fetchedModules.sort((a, b) => ((a.courseCode === b.courseCode) && (a.index - b.index)) )

  const data = jsonwebtoken.sign({ courses, modules, benefits, objectives, outlines }, env.ACCESS_TOKEN_SECRET )
  return res.json({ mix: data })
}

export async function edit_courses_controller(req, res){
  let { previousCourseCode, course, courseCode, overview, duration, availability, certificate, fee } = req.body
  if(!course) return res.json({ status: 403, msg: 'Enter a course name' })
  if(!courseCode) return res.json({ status: 403, msg: 'Enter a course code' })
  if(!overview) return res.json({ status: 403, msg: 'Enter course overview' })
  if(!certificate) return res.json({ status: 403, msg: '' })
  
  course = course.split('/').join(' or ')
  overview = overview.split('/').join(' or ')
  
  const fullCourse = { previousCourseCode, course, courseCode, overview, duration, availability, certificate, fee }

  const updatedCourse = await coursesModel.findOneAndUpdate({ courseCode: previousCourseCode }, fullCourse, { new: true } )
  const updateModules = await modulesModel.updateMany({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
  const updateBenefits = await benefitsModel.findOneAndUpdate({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
  const updateObjectives = await objectivesModel.findOneAndUpdate({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
  const updateOutlines = await outlinesModel.findOneAndUpdate({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
  if(!updatedCourse || !updateModules || !updateBenefits || !updateObjectives || !updateOutlines){
    await coursesModel.findOneAndUpdate({ courseCode }, fullCourse, { new: true } )
    await modulesModel.updateMany({ courseCode }, { $set: { courseCode } })
    await benefitsModel.findOneAndUpdate({ courseCode }, { $set: { courseCode } })
    await objectivesModel.findOneAndUpdate({ courseCode }, { $set: { courseCode } })
    await outlinesModel.findOneAndUpdate({ courseCode }, { $set: { courseCode } })

    return res.json({ status: 403, msg: 'Error encountered' })
  } 
  return res.json({ status: 201, msg: 'Course files edited' })
}

export async function edit_course_modules(req, res){
  const { modules } = req.body

  for(const module of modules){
    const { title, courseCode } = module
    if(!title) return res.json({ status: 403, msg: 'Some fields are missing module titles' })
    if(!courseCode) return res.json({ status: 403, msg: 'Assign course codes to modules' })
  }
}






















export async function create_courses(_, res){
  const fetchedCourses = await courseModel.find({ })
  .catch(err => res.json({ msg: err.message }))
  if(!fetchedCourses) return res.json({ msg: 'no courses found' })

  await modulesModel.deleteMany({  })
    
  for( const fetchedCourse of fetchedCourses){
    const fetchedModules = fetchedCourse.modules

    let arr = []
    for( const eachModule of fetchedModules){
      const newModule = {
        courseCode: fetchedCourse.courseCode,
        index: eachModule.index,
        title: eachModule.title,
        outline: eachModule.outline,
        link: eachModule.link
      }
      const newModules = modulesModel( newModule )
      await newModules.save()
    }
  }
  
  const courses = await modulesModel.find({  })
  console.log(courses)
  return res.json( courses )
}
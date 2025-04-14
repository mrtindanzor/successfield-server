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
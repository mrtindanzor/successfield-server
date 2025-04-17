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

export async function courses_operations_controller(req, res){
  let { 
    previousCourseCode, 
    course,
    courseCode,
    overview,
    duration,
    availability,
    certificate,
    fee,
    benefits,
    objectives,
    outlines,
    operation
  } = req.body

  if(!course) return res.json({ status: 403, msg: 'Enter a course name' })
  if(!courseCode) return res.json({ status: 403, msg: 'Enter a course code' })
  if(!overview) return res.json({ status: 403, msg: 'Enter course overview' })
  if(!certificate) return res.json({ status: 403, msg: '' })

  function loopArray(arrs){
    const loopArr = []
    for(let arr of arrs){
      if(!arr) continue
      arr = arr.trim().toLowerCase()
      loopArr.push(arr)
    }
    return loopArr
  }

  const newBenefits = benefits && benefits.length > 0 ? loopArray(benefits) : []
  const newObjectives = objectives && objectives.length > 0 ? loopArray(objectives) : []
  const newOutlines = outlines && outlines.length > 0 ? loopArray(outlines) : []

  
  course = course.split('/').join(' or ').trim().toLowerCase()
  overview = overview.split('/').join(' or ').trim().toLowerCase()
  courseCode = courseCode.trim().toLowerCase()
  overview = overview.trim().toLowerCase()
  availability = availability.trim().toLowerCase()
  certificate = certificate.trim().toLowerCase()
  fee = fee.trim().toLowerCase()
  
  const fullCourse = {
    course,
    courseCode,
    overview,
    duration,
    availability,
    certificate,
    fee
  }
  
  try {
    switch (operation) {
      case 'add':
        console.log(fullCourse)
        const isCourseExists = await coursesModel.findOne({ $or: [ { course },{courseCode} ] })
        if(isCourseExists) return res.json({ status: 403, msg: 'A course with this name or courseCode already exists' })
        const savecourse = new coursesModel(fullCourse)
        await savecourse.save()
        if(!savecourse || !savecourse._id) return res.json({ status: 403, msg: "Failed adding new course" })
              
        const saveBenefits = new benefitsModel({ courseCode, benefits: newBenefits })
        await saveBenefits.save()
        if(!saveBenefits || !saveBenefits._id) return res.json({ status: 403, msg: "Failed adding new course benefits" })
              
        const saveOutlines = new outlinesModel({ courseCode, outlines: newOutlines })
        await saveOutlines.save()
        if(!saveOutlines || !saveOutlines._id) return res.json({ status: 403, msg: "Failed adding new course outlines" })
              
        const saveObjectives = new objectivesModel({ courseCode, objectives: newObjectives })
        await saveObjectives.save()
        if(!saveObjectives || !saveObjectives._id) return res.json({ status: 403, msg: "Failed adding new course objectives" })
      break;
      
      case 'delete':
        const updatedCourse = await coursesModel.findOneAndDelete({ courseCode: previousCourseCode }, { new: true } )
        if(!updatedCourse) return res.json({ status: 403, msg: 'Failed deleting course' })
          
        const updatingBenefits = await benefitsModel.findOneAndDelete({ courseCode }, { new: true } )
        if(!updatingBenefits) return res.json({ status: 403, msg: 'Failed deleting course benefits' })
        
        const updatingObjectives = await objectivesModel.findOneAndDelete({ courseCode }, { new: true } )
        if(!updatingObjectives) return res.json({ status: 403, msg: 'Failed deleting course objectives' })
        
        const updatingOutlines = await outlinesModel.findOneAndDelete({ courseCode }, { new: true } )
        if(!updatingOutlines) return res.json({ status: 403, msg: 'Failed deleting course outlines' })
          break

      case 'edit':
        const isUpdatedCourse = await coursesModel.findOneAndUpdate({ courseCode: previousCourseCode }, fullCourse, { new: true } ).catch(err => console.log('course error ', err))
        
        if(!isUpdatedCourse) return res.json({ status: 403, msg: 'Failed updating course' })
          
        const isUpdatingBenefits = await benefitsModel.findOneAndUpdate({ courseCode }, { $set: { benefits: newBenefits } } )
        if(!isUpdatingBenefits) return res.json({ status: 403, msg: 'Failed updating course benefits' })
        
        const isUpdatingObjectives = await objectivesModel.findOneAndUpdate({ courseCode }, { $set: { objectives: newObjectives } } )
        if(!isUpdatingObjectives) return res.json({ status: 403, msg: 'Failed updating course objectives' })
        
        const isUpdatingOutlines = await outlinesModel.findOneAndUpdate({ courseCode }, { $set: { outlines: newOutlines } } )
        if(!isUpdatingOutlines) return res.json({ status: 403, msg: 'Failed updating course outlines' })
        
        if(previousCourseCode.trim().toLowerCase() !== courseCode.trim().toLowerCase() ){
          const updateModules = await modulesModel.updateMany({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
          const updateBenefits = await benefitsModel.findOneAndUpdate({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
          const updateObjectives = await objectivesModel.findOneAndUpdate({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
          const updateOutlines = await outlinesModel.findOneAndUpdate({ courseCode: previousCourseCode }, { $set: { courseCode } }, { new: true } )
          if(!updateModules || !updateBenefits || !updateObjectives || !updateOutlines){
            await coursesModel.findOneAndUpdate({ courseCode }, fullCourse, { new: true } )
            await modulesModel.updateMany({ courseCode }, { $set: { courseCode } })
            await benefitsModel.findOneAndUpdate({ courseCode }, { $set: { courseCode } })
            await objectivesModel.findOneAndUpdate({ courseCode }, { $set: { courseCode } })
            await outlinesModel.findOneAndUpdate({ courseCode }, { $set: { courseCode } })
        
            return res.json({ status: 403, msg: 'Error encountered' })
          } 
        }
      break
    }

    return res.json({ status: 201, msg: 'Operation completed' })
  } catch (err) {
    console.log(err)
    return res.json({ status: 500, msg: err.message })
  }

}

export async function modules_operations_controller(req, res){
  const { modules, operation } = req.body

  if(!modules) return res.json({ status: 403, msg: 'Add modules to continue' })

  let successCount = 0
  let failedCount = []

  try {

    for (const module of modules){
      let { courseCode } = module
      courseCode = courseCode.trim().toLowerCase()
      const isValidCode = await coursesModel.findOne({ courseCode })
      if(!isValidCode) return res.json({ status: 403, msg: `Course code: ${courseCode} is not valid` })
    }

    for(const module of modules){

      if(!module.title) {
        failedCount.push({ ...module, error: 'Module does not have a title' })
        continue
      }

      if(!module.courseCode) {
        failedCount.push({ ...module, error: 'Module does not have a course code' })
        continue
      }

      const isExists = await modulesModel.findOne({ courseCode: module.courseCode, title: module.title })

      if(isExists && operation === 'add') {
        failedCount.push({ ...module, error: 'Module with same title already exists' })
        continue
      }

      const objectives = []
      const topics = []
      const notes = []
  
      for(const value of module.objectives ){
        if(!value) continue
        objectives.push(value)
      }
  
      for(const value of module.topics ){
        if(!value) continue
        topics.push(value)
      }
  
      for(const value of module.notes ){
        if(!value) continue
        notes.push(value)
      }
  
      const m = {
        title: module.title,
        courseCode: module.courseCode,
        outline: module.title,
        objectives,
        topics,
        notes
      }
      
      switch (operation) {
        case 'add':
          const addModule = new modulesModel(m)
          await addModule.save()
          if(!addModule || !addModule._id){
            successCount++
          } else{
            failedCount.push({ title: m.title, courseCode: m.courseCode, error: 'Error adding module' })
          }
            break;
      
        case 'edit':
          const updateModule = await modulesModel.findOneAndUpdate({ courseCode: m.courseCode, title: module.titles })
          if(!updateModule){
            failedCount.push({ title: m.title, courseCode: m.courseCode, error: 'Error updating module' })
          } else{
            successCount++
          }
            break;
      }

      
    }
  } catch (err) {
    console.log(err)
    return res.json({ status: 500, msg: err.message })
  }
  
  if(failedCount.length > 0) return res.json({ status: 403, msg: 'Operation completed with some errors', success: successCount, failed: failedCount })
  return res.json({ status: 201, msg: 'Added modules successfully' })
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
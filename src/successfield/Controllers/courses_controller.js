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
    for(const arr of arrs){
      if(!arr) continue
      loopArr.push(arr)
    }
    return loopArr
  }

  const newBenefits = benefits && benefits.length > 0 ? loopArray(benefits) : []
  const newObjectives = objectives && objectives.length > 0 ? loopArray(objectives) : []
  const newOutlines = outlines && outlines.length > 0 ? loopArray(outlines) : []

  
  course = course.split('/').join(' or ')
  overview = overview.split('/').join(' or ')
  
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
        const savecourse = new coursesModel(fullCourse)
        await savecourse.save()
                .then(() => {
                  if(!savecourse.isnew) return res.json({ status: 403, msg: "Failed adding new course" })
                })
              
        const saveBenefits = new benefitsModel({ courseCode, benefits: newBenefits })
        await saveBenefits.save()
                .then(() => {
                  if(!saveBenefits.isnew) return res.json({ status: 403, msg: "Failed adding new course benefits" })
                })
              
        const saveOutlines = new outlinesModel({ courseCode, outlines: newOutlines })
        await saveOutlines.save()
                .then(() => {
                  if(!saveOutlines.isnew) return res.json({ status: 403, msg: "Failed adding new course outlines" })
                })
              
        const saveObjectives = new objectivesModel({ courseCode, objectives: newObjectives })
        await saveObjectives.save()
                .then(() => {
                  if(!saveObjectives.isnew) return res.json({ status: 403, msg: "Failed adding new course objectives" })
                })
          break;
      
      case 'delete':
        const updatedCourse = await coursesModel.findOneAndDelete({ courseCode: previousCourseCode } { new: true } )
        if(!updatedCourse) return res.json({ status: 403, msg: 'Failed deleting course' })
          
        const updatingBenefits = await benefitsModel.findOneAndDelete({ courseCode }, { new: true } )
        if(!updatingBenefits) return res.json({ status: 403, msg: 'Failed deleting course benefits' })
        
        const updatingObjectives = await objectivesModel.findOneAndDelete({ courseCode }, { new: true } )
        if(!updatingObjectives) return res.json({ status: 403, msg: 'Failed deleting course objectives' })
        
        const updatingOutlines = await outlinesModel.findOneAndDelete({ courseCode }, { new: true } )
        if(!updatingOutlines) return res.json({ status: 403, msg: 'Failed deleting course outlines' })
          break

      case 'edit':
        const updatedCourse = await coursesModel.findOneAndUpdate({ courseCode: previousCourseCode }, fullCourse, { new: true } )
        if(!updatedCourse) return res.json({ status: 403, msg: 'Failed updating course' })
          
        const updatingBenefits = await benefitsModel.findOneAndUpdate({ courseCode }, { $set: { benefits: newBenefits } } )
        if(!updatingBenefits) return res.json({ status: 403, msg: 'Failed updating course benefits' })
        
        const updatingObjectives = await objectivesModel.findOneAndUpdate({ courseCode }, { $set: { objectives: newObjectives } } )
        if(!updatingObjectives) return res.json({ status: 403, msg: 'Failed updating course objectives' })
        
        const updatingOutlines = await outlinesModel.findOneAndUpdate({ courseCode }, { $set: { outlines: newOutlines } } )
        if(!updatingOutlines) return res.json({ status: 403, msg: 'Failed updating course outlines' })
        
        if(previousCourseCode.trim().toLowerCase() !== courseCode.trim().toLowerCase() ){
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
        }
        return res.json({ status: 201, msg: 'Operation completed' })
          break
    }
  } catch (err) {
    return res.json({ status: 500, msg: 'Operation could not be completed' })
  }

}

export async function edit_course_modules(req, res){
  const { modules } = req.body

  if(!modules) return res.json({ status: 403, msg: 'Add modules to continue' })

  let successCount = 0
  let failedCount = []

  for(const module of modules){
    const { title, courseCode } = module
    
  }


  try {
    for(const module of modules){

      if(!module.title) {
        failedCount.push({ title: module.title, courseCode: module.courseCode, reason: 'Module does not have a title' })
        continue
      }

      if(!module.courseCode) {
        failedCount.push({ title: module.title, courseCode: module.courseCode, reason: 'Module does not have a course code' })
        continue
      }

      const isExists = await modulesModel.findOne({ courseCode: module.courseCode, title: module.title })

      if(isExists) {
        failedCount.push({ title: module.title, courseCode: module.courseCode, reason: 'Module with same title already exists' })
        continue
      }

      const objectives = []
      const topics = []
      const notes = []
  
      for(const value of modules.objectives ){
        if(!value) continue
        objectives.push(value)
      }
  
      for(const value of modules.topics ){
        if(!value) continue
        topics.push(value)
      }
  
      for(const value of modules.notes ){
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
  
      const addModule = new modulesModel(m)
      addModule.save()
        .then(() => {
          if(!addModule.isnew){
            successCount++
          } else{
            failedCount.push({ title: m.title, courseCode: m.courseCode, reason: 'Error saving file to database' })
          }
        })
    }
  } catch (err) {
    return res.json({ status: 500, msg: 'An error occured while performing operations' })
  }

  if(failedCount.length > 0) return res.json({ status: 403, msg: 'Operation completed with some errors', successCount, failedCount })
  return res.json({ status: 201, msg: 'Added modules successfully' successCount, failedCount })
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
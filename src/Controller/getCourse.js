const { courseModel } = require('./../../core')

module.exports.getCourses = async function(_, res){
  const courses = await courseModel.find({})
  return res.json(courses)
}
const router = require('express').Router()
const auth = require('./src/Authentication/auth')
const { getCourses } = require('./src/Controller/getCourse')
const { courseModel } = require('./core')

router.use(auth)
router.post('/courses', async function(_, res){
  const courses = await courseModel.find({})
  return res.json(courses)
})

module.exports = router
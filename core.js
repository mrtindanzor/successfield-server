require('dotenv').config()
const mongoose = require('mongoose')
const schema = mongoose.Schema
module.exports.env = process.env

module.exports.createStudentId = function(db){
  const prefix = 'sfc'
  const year = new Date().getFullYear()
  let newStudent = false
  let studentNumber = ''

  while(!newStudent){
    let random = String(new Date().getTime())
    random = random.split('').splice(7).join('')
    studentNumber = prefix + '-' + year + '-' + random
    const isStudentNumberExists = db.find(el => el.studentNumber === studentNumber)
    if(!isStudentNumberExists) newStudent = true
  }

  return studentNumber
}

const certificateSchema = new schema({
  name: String,
  studentNumber: String,
  certificateCode: String,
  programme: String,
  dateCompleted: String
})

const addressShema = new schema({
  country: String,
  state: String,
  city: String,
  address1: String,
  address2: String,
  postalCode: String
})

const moduleSchema = new schema({
  index: Number,
  title: String,
  link: String
})

const userSchema = new schema({
  firstname: String,
  middlename: String,
  surname: String,
  password: String,
  email: String,
  phone: Number,
  address: addressShema,
  studentNumber: String,
  admin: Boolean,
  date: String,
  verificationCode: String,
  isnew: Boolean,
  verified: Boolean,
  namechanged: Boolean,
  courses: [{course: String, module: Number, moduleName: String}]
})

const courseSchema = new schema({
  course: String,
  courseCode: String,
  overview: String,
  outlines: [{ outline: String}],
  objectives: [{ objective: String }],
  benefits: [{ benefit: String }],
  modules: [moduleSchema],
  duration: String,
  availability: String,
  certificate: String,
  fee: String
})

const partnerSchema = new schema({
  name: String,
  location: String,
  approvals: [{approval: String}],
  partnerId: String
})

module.exports.certificateModel = mongoose.model('certificate', certificateSchema)
module.exports.userModel = mongoose.model('user', userSchema)
module.exports.courseModel = mongoose.model('course', courseSchema)
module.exports.modulesModel = mongoose.model('module', moduleSchema)
module.exports.addressModel = mongoose.model('address', addressShema)
module.exports.partnerModel = mongoose.model('partner', partnerSchema)
// mongoose.connect(process.env.DATABASE)
// mongoose.connection.once('open', databaseConnection)
        // .on('error', databaseError)

function databaseConnection(){
  console.log('connected to database')
}
function databaseError(err){
  console.log('Error connecting to database', err)
}
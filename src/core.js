import dotenv from 'dotenv'
import mongoose from 'mongoose'
const schema = mongoose.Schema
const model = mongoose.model
export const env = process.env

dotenv.config()

export function generateCode(db, operation, courseCode=''){
  let code = ''
  const year = new Date().getFullYear()

  const prefix = 'sfc'
  let uniqueCode = false

  while(!uniqueCode){
    let random = String(new Date().getTime()).split('').splice(7).join('')
    if(operation === 'student') code = prefix + '-' + year + '-' + random
    if(courseCode) code = courseCode.trim() + '-' + random
    let isCodeExists = ''
    if(operation === 'student') isCodeExists = db.find(el => el.studentNumber === studentNumber)
    if(courseCode) isCodeExists = db.find(el => el.courseCode === courseCode.toLowerCase().trim())
    if(!isCodeExists) uniqueCode = true
  }
  return code.toLowerCase()
}

const certificateSchema = new schema({
  name: String,
  studentNumber: String,
  certificateCode: String,
  programme: String,
  dateCompleted: String,
  courseCode: String,
  year: String
})

const applicationSchema = new schema({
  term: Number,
  students: [{
    studentNumber: String,
    date: String
  }]
})

const studentSchema = new schema({
  term: Number,
  students: [{
    studentNumber: String,
    date: String
  }]
})

const OfferedCourseSchema = new schema({
  courseCode: String,
  students: [{ term: String, studentNumber: String }]
})

const moduleSchema = new schema({
  courseCode: String,
  index: Number,
  title: String,
  outline: String,
  objectives: [ String ],
  topics: [ String ],
  notes: [ String ],
  questions: [{ question: String, ans: String, options: { a: String, b: String, c: String, d: String } }],
  link: String
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

const coursesSchema = new schema({
  course: String,
  courseCode: String,
  overview: String,
  duration: String,
  availability: String,
  certificate: String,
  fee: String
})

const benefitsSchema = new schema({
  courseCode: String,
  benefits: [ String ]
})

const outlinesSchema = new schema({
  courseCode: String,
  outlines: [ String ]
})

const objectivesSchema = new schema({
  courseCode: String,
  objectives: [ String ]
})

const addressShema = new schema({
  country: String,
  state: String,
  city: String,
  address1: String,
  address2: String
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
  birthDate: String,
  idDocument: String, 
  passportPhoto: String,
  educationLevel: String,
  date: String,
  verificationCode: String,
  newApplication: Boolean,
  verified: Boolean,
  namechanged: Boolean,
  admin: Boolean
})

const partnerSchema = new schema({
  name: String,
  location: String,
  approvals: [{approval: String}],
  partnerId: String
})

export const certificateModel = model('certificate', certificateSchema)
export const userModel = model('user', userSchema)
export const courseModel = model('course', courseSchema)
export const addressModel = model('address', addressShema)
export const partnerModel = model('partner', partnerSchema)

export const applicationModel = model('application', applicationSchema)
export const studentModel = model('student', studentSchema)
export const OfferedCourseModel = model('offeredcourse', OfferedCourseSchema)

export const coursesModel = model('newcourse', coursesSchema)
export const modulesModel = model('module', moduleSchema)
export const objectivesModel = model('objective', objectivesSchema)
export const outlinesModel = model('outline', outlinesSchema)
export const benefitsModel = model('benefit', benefitsSchema)

mongoose.connect( env.PROD_ENV === 'PROD' ? env.DATABASE : env.DEV_DATABASE )
mongoose.connection.once('open', databaseConnection).on('error', databaseError)

env.PROD_ENV === 'PROD' && setInterval(() => fetch(env.LIVE_SERVER_URI).then(() => console.log('fetched')), 14 * 60 * 1000)

function databaseConnection(){
  console.log('connected to database')
}
function databaseError(err){
  console.log('Error connecting to database', err)
}
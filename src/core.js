import dotenv from 'dotenv'
import mongoose from 'mongoose'
const schema = mongoose.Schema
export const env = process.env

dotenv.config()

export function createStudentId(db){
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
  programme: String,
  birthDate: String,
  idDocument: { photo: String }, 
  passportPhoto: { photo: String },
  educationLevel: String,
  date: String,
  verificationCode: String,
  isnew: Boolean,
  newApplication: Boolean,
  verified: Boolean,
  namechanged: Boolean,
  admin: Boolean,
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

export const certificateModel = mongoose.model('certificate', certificateSchema)
export const userModel = mongoose.model('user', userSchema)
export const courseModel = mongoose.model('course', courseSchema)
export const modulesModel = mongoose.model('module', moduleSchema)
export const addressModel = mongoose.model('address', addressShema)
export const partnerModel = mongoose.model('partner', partnerSchema)

mongoose.connect( env.PROD_ENV === 'PROD' ? env.DATABASE : env.DEV_DATABASE )
mongoose.connection.once('open', databaseConnection).on('error', databaseError)

env.PROD_ENV === 'PROD' && setInterval(() => fetch(env.LIVE_SERVER_URI).then(() => console.log('fetched')), 14 * 60 * 1000)

function databaseConnection(){
  console.log('connected to database')
}
function databaseError(err){
  console.log('Error connecting to database', err)
}
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { generateCode, env, userModel, applicationModel } from '../../core.js';
const stringPattern = /^[\w\s.,-]+$/
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const setAcToken = (res, payload) => {
  const token = jsonwebtoken.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  const refreshToken = jsonwebtoken.sign({ email: payload.email }, env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' })
  if(env.PROD_ENV === 'PROD'){
    res.cookie('ac', refreshToken , { signed: true, httpOnly: true, secure: env.PROD_ENV === 'PROD', maxAge: 60 * 60 * 1000, sameSite: 'none' })
  }
    else{
    res.cookie('ac', refreshToken, { signed: true, httpOnly: true, secure: false, maxAge: 60 * 60 * 1000 })
  }

  return token
}

export async function registerController(req, res){
  let {  programme, firstname, middlename, surname, birthDate, address, idDocument, passportPhoto, phoneNumber, email, educationLevel, contact, password, cpassword } = req.body

  if(contact) return res.json({ status: 403, msg: 'Registration could not be completed at the moment' })
  if(!programme) return res.json({ status: 403, msg: 'Select a programme' })
  if(!firstname) return res.json({ status: 403, msg: 'Enter your firstname' })
  if(!surname) return res.json({ status: 403, msg: 'Enter your surname' })
  if(!address) return res.json({ status: 403, msg: 'Enter your address' })
  if(!idDocument) return res.json({ status: 403, msg: 'Select an ID document' })
  if(!passportPhoto) return res.json({ status: 403, msg: 'Select a passport photo' })
  if(!phoneNumber) return res.json({ status: 403, msg: 'Enter your contact number' })
  if(!educationLevel) return res.json({ status: 403, msg: 'Select your highest level of education' })
  if(!email) return res.json({ status: 403, msg: 'Enter your email' })
  if(!password) return res.json({ status: 403, msg: 'Enter a password' })
  if(!cpassword) return res.json({ status: 403, msg: 'Confirm your new password' })
  if(password !== cpassword) return res.json({ status: 403, msg: 'Passwords do not match' })
  
  firstname = firstname.trim().toLowerCase()
  middlename = middlename.trim().toLowerCase()
  surname = surname.trim().toLowerCase()
  email = email.trim().toLowerCase()

  if(!firstname.match(stringPattern)) return res.json({ status: 403, msg: 'Firstname contains invalid characters' })
  if(middlename && !middlename.match(stringPattern)) return res.json({ status: 403, msg: 'Middlename contains invalid characters' })
  if(!surname.match(stringPattern)) return res.json({ status: 403, msg: 'Surname contains invalid characters' })
  if(!email.match(emailPattern)) return res.json({ status: 403, msg: 'Email contains invalid characters' })
  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const day = new Date().getDay() + 1
  const date = `${year} - ${month} - ${day}`

  try {
    await userModel.deleteOne({ email })
    const userExists = await userModel.findOne({ email }) 
    if(userExists) return res.json({ status: 403, msg: 'A user with this email address already exists.' })
    const users = await userModel.find({ })
    const hashedPassword = await bcrypt.hash(password, 10)
    const studentNumber = generateCode(users, 'student')
    const studentDetails = {
      firstname,
      middlename,
      surname,
      birthDate,
      address,
      idDocument,
      passportPhoto,
      phone: phoneNumber,
      email,
      educationLevel,
      password: hashedPassword,
      studentNumber,
      newApplication: true,
      date 
    }
    const isTerm = await applicationModel.findOne({ term: year })
    if(!isTerm){
      const newApplication = new applicationModel({ term: year, students: [{ studentNumber, date }] })
      await newApplication.save()
      if(!newApplication || !newApplication._id) return res.json({ status: 403, msg: 'Application could not be completed at the moment' })
            
    } else{
      const updateApplications = await applicationModel.findOneAndUpdate({ term: year }, { $push: { students:  { studentNumber, date } } }, { new: true })
      if(!updateApplications) return res.json({ status: 403, msg: 'Application could not be completed at the moment' })
    }
    
    const newUser = new userModel(studentDetails)
    await newUser.save()
    if(!newUser || !newUser._id) return res.json({ status: 201, msg: 'Application complete, wait for registrars\' confirmation.' })
    return res.json({ status: 403, msg: 'Unable to complete application at the moment' })
      
  } catch (err){
    return res.json({ status: 500, msg: err.message })
  }
}

export async function loginController(req, res){
  let { email, password } = req.body
  if(!email) return res.json({ status: 403, msg: 'Enter a valid email address' })
    if(!password) return res.json({ status: 403, msg: 'Enter password' })
      email = email.toLowerCase().trim()
    password = password.trim()
    if(!emailPattern.test(email)) return res.json({ status: 403, msg: 'Enter a valid email address' })
      
    try{
      const findUser = await userModel.findOne({ email })
      if(!findUser) return res.json({ status: 404, msg: 'Invalid credentials' })
      const isPasswordMatch = await bcrypt.compare(password, findUser.password)
      if(!isPasswordMatch) return res.json({ status: 402, msg: 'Incorrect password' })
      const user = { ...findUser._doc, password: '', idDocument: '', passportPhoto: '' }
      const token = setAcToken(res, user)

      return res.json({ status: 200, msg: 'Signed in, redirecting you to homepage.', token })  
  } catch(err){
    console.log(err)
    return res.json({ status: 500, msg: err.msg ?? 'An error was encoutered' })
  }
} 

export async function refreshController(req, res){
  const cookie = req.signedCookies.ac
  if(!cookie) return res.json({ token: '' })
    try{
      jsonwebtoken.verify(cookie, env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if(err) return res.json({ token: ''})
        
        const latestUser = await userModel.findOne({ email: user.email })
        if(!latestUser) return res.json({ token: '' })
        const newUser = { ...latestUser._doc, passportPhoto: '', idDocument:'' }
        const token = setAcToken(res, newUser)
        return res.json({ token })
      })
    }
      catch(err) {
        console.log(err.message)
        return res.json({  token: '' })
    }
}

export async function getUserPicture(req, res) {
  const { email } = req.body

  const user = await userModel.findOne({ email })
  if(!user) return res.json({ pic: '' })
  const currentUser = { ...user._doc }
  if(currentUser.image) return res.json({ pic: currentUser.image.url })
  if(currentUser.passportPhoto) return res.json({ pic: currentUser.passportPhoto })
  return res.json({ pic: '' })
}

export async function change_password(req, res){
  const { email, oldPassword, newPassword, confirmNewPassword } = req.body

  if(newPassword !== confirmNewPassword) return res.json({ status: 403, msg: 'Passwords do not match' })
  const user = await userModel.findOne({ email })
  if(!user) return res.json({ status: 404, msg: 'Unable to process request at the moment' })
  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if(!isMatch) return res.json({ status: 403, msg: 'Old password is not correct' })
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  const isChanged = userModel.findOneAndUpdate({ email },{ $set: { password: hashedPassword } },{ new: true })
  if(isChanged) return res.json({ status: 201, msg: 'Password changed' })
  return res.json({ status: 500, msg: 'Unable to process request at the moment' })
}

export async function change_name(req, res){
  const { email, firstname, middlename, surname } = req.body

  if(!firstname || !surname) return res.json({ status: 403, msg: 'Enter a valid name' })
  const user = await userModel.findOne({ email })
  const currentUser = { ...user._doc }
  if(currentUser.namechanged && !currentUser.admin) return res.json({ status: 403, msg: 'Name can only changed once, contact support for any changes' })
  const isChanged = await userModel.findOneAndUpdate({ email },{ $set: { firstname, middlename, surname, namechanged: true } }, { new: true })
  if(isChanged) return res.json({ status: 201, msg: "Name updated" })
  return res.json({ status: 500, msg: 'Unable to process request at the moment' })
}

export async function change_email(req, res) {
  const { email, newEmail } = req.body

  if(!emailPattern.test(newEmail)) return res.json({ status: 403, msg: 'Invalid email format' })
  if(email === newEmail) return res.json({ status: 403, msg: 'New email must not be the same as old email' })
  const isExists = await userModel.findOne({ email: newEmail })
  if(isExists) return res.json({ status: 403, msg: 'A user with this email exists' })


  try{
    const isUpdated = await userModel.findOneAndUpdate({ email }, { $set: { email: newEmail } },{ new: true })

    if(isUpdated) {
      const user = { ...isUpdated._doc, password: '', idDocument: '', passportPhoto: '' }
      
      const token = setAcToken(res, user) 
      res.json({ status: 201, msg: 'Email updated', token })
    }
  } catch(err){
    return res.json({ status: 500, msg: 'Unable to process request at the moment' })
  }
  
}

export async function change_phone(req, res) {
  const { email, phoneNumber } = req.body

  if(!phoneNumber) return res.json({ status: 403, msg: 'Invalid phone number' })
  if(!email) return res.json({ status: 403, msg: 'Unable to process request at the moment' })
  const isUpdated = await userModel.findOneAndUpdate({ email }, { $set: { phone: phoneNumber } },{ new: true })
  if(isUpdated) return res.json({ status: 201, msg: 'Phone number updated' })
  return res.json({ status: 500, msg: 'Unable to process request at the moment' })
}
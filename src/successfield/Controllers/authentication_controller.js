import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createStudentId, env, userModel } from '../../core.js';
const stringPattern = /^[\w\s.,-]+$/
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export async function registerController(req, res){
  let { firstname, middlename, surname, email, password, cpassword} = req.body
  if(!firstname) return res.json({ status: 403, msg: 'Enter your firstname' })
  if(!surname) return res.json({ status: 403, msg: 'Enter your surname' })
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

  try {
    const userExists = await userModel.findOne({ email }) 
    if(userExists) return res.json({ status: 403, msg: 'A user with this email address already exists.' })
    const users = await userModel.find({ })
    const hashedPassword = await bcrypt.hash(password, 10)
    const studentNumber = await createStudentId(users).toLowerCase()
    const studentDetails = { firstname, middlename, surname, email, password: hashedPassword, studentNumber }
    const newUser = new userModel(studentDetails)
    newUser.save()
      .then(() => {
        if(!newUser.isnew){
          return res.json({ status: 201, msg: 'Sign up complete, redirecting to log in page.' })
        }
      })
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
    const user = { ...findUser._doc }
    delete user.password
    const token = jsonwebtoken.sign(user, env.ACCESS_TOKEN_SECRET, {expiresIn: '15m' })
    const refreshToken = jsonwebtoken.sign(user, env.REFRESH_TOKEN_SECRET, {expiresIn: '1h' })

    if(env.PROD_ENV === 'PROD'){
      res.cookie('ac', refreshToken, { signed: true, httpOnly: true, secure: env.PROD_ENV === 'PROD', maxAge: 60 * 60 * 1000, sameSite: 'none' })
    }
      else {
      res.cookie('ac', refreshToken, { signed: true, httpOnly: true, secure: false, maxAge: 60 * 60 * 1000 })
    }

    return res.json({ status: 200, msg: 'Signed in, redirecting you to homepage.', token })  
  } catch(err){
    return res.json({ status: 500, msg: err.msg ?? 'An error was encoutered' })
  }
} 

export async function refreshController(req, res){
  const cookie = req.signedCookies.ac
  if(!cookie) return res.json({ token: '' })
    try{
      jsonwebtoken.verify(cookie, env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.json({ token: ''})
        delete user.iat
        delete user.exp
        const token = jsonwebtoken.sign(user, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshToken = jsonwebtoken.sign(user, env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' })
        if(env.PROD_ENV === 'PROD'){
          res.cookie('ac', refreshToken, { signed: true, httpOnly: true, secure: env.PROD_ENV === 'PROD', maxAge: 60 * 60 * 1000, sameSite: 'none' })
        }
          else{
          res.cookie('ac', refreshToken, { signed: true, httpOnly: true, secure: false, maxAge: 60 * 60 * 1000 })
        }
        return res.json({ token })
      })
    }
      catch(err) {
        console.log(err.message)
        return res.json({  token: '' })
    }
}
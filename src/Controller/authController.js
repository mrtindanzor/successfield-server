import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createStudentId, env, userModel } from './../../core.js';
const stringPattern = /^[\w\s.,-]+$/
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const usersDb = []

export async function registerController(req, res){
  let { firstname, middlename, surname, email, password, cpassword} = req.body
  if(!firstname) return res.json({ status: 403, msg: 'Enter your firstname' })
  if(!surname) return res.json({ status: 403, msg: 'Enter your surname' })
  if(!email) return res.json({ status: 403, msg: 'Enter your email' })
  if(!password) return res.json({ status: 403, msg: 'Enter a password' })
  if(!cpassword) return res.json({ status: 403, msg: 'Confirm your new password' })
  if(password !== cpassword) return res.json({ status: 403, msg: 'Passwords do not match' })
  
  firstname = firstname.trim().toLowerCase()
  middlename = firstname.trim().toLowerCase()
  surname = surname.trim().toLowerCase()
  email = email.trim().toLowerCase()

  if(!firstname.match(stringPattern)) return res.json({ status: 403, msg: 'Firstname contains invalid characters' })
  if(middlename && !middlename.match(stringPattern)) return res.json({ status: 403, msg: 'Middlename contains invalid characters' })
  if(!surname.match(stringPattern)) return res.json({ status: 403, msg: 'Surname contains invalid characters' })
  if(!email.match(emailPattern)) return res.json({ status: 403, msg: 'Email contains invalid characters' })

  try {
    if(env.PROD_ENV === 'PROD'){
      const userExists = await userModel.findOne({ email }) 
      if(userExists) return res.json({ status: 403, msg: 'A user with this email address already exists.' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const studentNumber = await createStudentId(usersDb).toLowerCase()
    const studentDetails = { firstname, middlename, surname, email, password: hashedPassword, studentNumber }
    if(env.PROD_ENV === 'PROD'){
      const newUser = new userModel(studentDetails)
      newUser.save()
        .then(() => {
          if(!newUser.isnew){
            return res.json({ status: 201, msg: 'Sign up complete, redirecting to log in page.' })
          }
        })
    }
    usersDb.push(studentDetails)
    return res.json({ status: 201, msg: 'Sign up complete, proceed to log in.' })
  } catch (err){
    return res.json({ status: 500, msg: err.message })
  }
}

export async function loginController(req, res){
  let { email, password } = req.body
  if(!email) return res.json({ status: 403, msg: 'Enter a valid email address' })
  if(!password) return res.json({ status: 403, msg: 'Enter password' })
  if(!emailPattern.test(email)) return res.json({ status: 403, msg: 'Enter a valid email address' })

  email = email.toLowerCase().trim()
  password = password.trim()

  try{
    const user = env.PROD_ENV === 'PROD' ? await userModel.findOne({ email }) : usersDb.find(student => student.email === email)
    if(!user) return res.json({ status: 404, msg: 'Invalid credentials' })
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if(!isPasswordMatch) return res.json({ status: 402, msg: 'Incorrect password' })
    const newUser = { ...user._doc }
    delete newUser.password
    const payload = {...newUser}
    const token = jsonwebtoken.sign(payload, env.ACCESS_TOKEN_SECRET, {expiresIn: '15m' })
    const refreshToken = jsonwebtoken.sign(payload, env.REFRESH_TOKEN_SECRET, {expiresIn: '15d' })
    const maxAge = 60 * 60 * 1000
    res.cookie('authorizationCookie', refreshToken, { signed: true, httpOnly: true, secure: env.PROD_ENV === 'PROD' ? true : false, maxAge, sameSite: 'none' })
    if(env.PROD_ENV === 'PROD'){
      return res.json({ status: 200, msg: 'Signed in, redirecting you to homepage.', token, newUser: payload })
    }
    return res.json({ status: 200, msg: 'Signed in, redirecting you to homepage.', token, newUser })  
  } catch(err){
    return res.json({ status: 500, msg: err.msg ?? 'An error was encoutered' })
  }
} 

export async function refreshController(req, res){
  const cookie = req.signedCookies.authorizationCookie
  if(!cookie) return res.json({ token: '' })
    try{
      jsonwebtoken.verify(cookie, env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if(err) return res.json({ token: ''})
        delete payload.iat
        delete payload.exp
        console.log(payload)
        const token = jsonwebtoken.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshToken = jsonwebtoken.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' })
        console.log('after jwt')
        res.cookie('authorizationCookie', refreshToken, { signed: true, maxAge: 60 * 60 * 1000, secure: env.PROD_ENV === 'PROD' ? true : false, maxAge, sameSite: 'none'  })
        console.log('after cookie')
        console.log(token)
        console.log('after token')
        console.log(payload)
        return res.json({ token, user: payload })
      })
    }
      catch(err) {
        return res.json({  token: '' })
    }
}
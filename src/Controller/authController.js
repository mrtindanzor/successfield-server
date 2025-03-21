import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createStudentId, env } from './../../core.js';
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
    const hashedPassword = await bcrypt.hash(password, 10)
    const studentNumber = await createStudentId(usersDb).toLowerCase()
    const studentDetails = { firstname, middlename, surname, email, password: hashedPassword, studentNumber }
    usersDb.push(studentDetails)
    return res.json({ status: 201, msg: 'Sign up complete, proceed to log in.' })
  } catch (err){
    console.log(err.message)
    return res.json({ status: 500, msg: err.message })
  } finally{
    console.log(usersDb)
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
    const user = await usersDb.find(student => student.email === email)
    if(!user) return res.json({ status: 404, msg: 'Invalid credentials' })
      console.log(user)
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if(!isPasswordMatch) return res.json({ status: 402, msg: 'Incorrect password' })
    const newUser = { ...user }
    delete newUser.password
    const token = jsonwebtoken.sign(newUser, env.ACCESS_TOKEN_SECRET, {expiresIn: '15m' })
    const refreshToken = jsonwebtoken.sign(newUser, env.REFRESH_TOKEN_SECRET, {expiresIn: '15d' })
    const maxAge = 15 * 24 * 60 * 60 * 1000
    res.cookie('authorizationCookie', refreshToken, { signed: true, httpOnly: true, secure: false, maxAge })
    return res.json({ status: 200, msg: 'Signed in', token, newUser })
  } catch(err){
    console.log(err.message)
    return res.json({ status: 500, msg: err.msg ?? 'An error was encoutered' })
  } finally{
    console.log(usersDb)
  }
  
} 

export async function refreshController(req, res){
  const cookie = req.signedCookies.authorizationCookie
  if(!cookie) return res.json({ token: '' })
    try{
      jsonwebtoken.verify(cookie, env.REFRESH_TOKEN_SECRET, (err, payload) => {
        delete payload.iat
        delete payload.exp
      
        const token = jsonwebtoken.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        res.json({ token, user: payload })
      })
    }
      catch(err) {
        return res.json({  token: ' ' })
    }
}
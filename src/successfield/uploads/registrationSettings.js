import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadPath = __dirname


const storage = multer.diskStorage({
                                destination: (req, file, cb) => cb(null, uploadPath),
                                filename: (req, file, cb) => {
                                  const prefix = 'sfc-'
                                  const now = new Date()
                                  const date = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDay()
                                  const name = prefix + date + '-' + file.originalname
                                  cb(null, name)
                                }  
                              })

const upload = multer({ storage })

const uploadFields = upload.fields([
                                   { name: 'idDocument', maxCount: 1 },
                                   { name: 'passportPhoto', maxCount: 1 }
                                  ])

export default uploadFields
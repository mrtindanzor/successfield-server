import { certificateModel } from '../../core.js'

export default async function verify_controller(req, res){
  let { certificateCode } = req.body
  certificateCode = certificateCode.toLowerCase().trim()

  const certificate = await certificateModel.findOne({ certificateCode })
  if(!certificate) return res.json({ status: 403, msg: 'Invalid Certificate ID' })
  return res.json({ status: 200, certificate })
}
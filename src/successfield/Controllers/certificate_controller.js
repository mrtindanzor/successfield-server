import { certificateModel, userModel, coursesModel, generateCode } from '../../core.js'

export default async function verify_controller(req, res){
  let { certificateCode } = req.body
  certificateCode = certificateCode.toLowerCase().trim()

  const certificate = await certificateModel.findOne({ certificateCode })
  if(!certificate) return res.json({ status: 403, msg: 'Invalid Certificate ID' })
  return res.json({ status: 200, certificate })
}

export async function certificate_operations(req, res) {
  let {
          operation,
          courseCode,
          studentNumber,
          dateCompleted,
          certificateCode
        } = req.body

  if(operation === 'findCertificate'){
    const findCertificates = await certificateModel.find({ studentNumber })
    if(!findCertificates && findCertificates.length < 1) return res.json({ status: 403, msg: `No certificate associated to Student number: ${studentNumber}` })
    return res.json({ status: 200, findCertificates })
  }

  if(courseCode || courseCode || studentNumber || dateCompleted) return res.json({ status: 403, msg: 'All fields required' })
  
  studentNumber = studentNumber.toLowerCase().trim()
  courseCode = courseCode.trim().toLowerCase()
  dateCompleted = dateCompleted.trim().toLowerCase()
  if(certificateCode) certificateCode = certificateCode.trim().toLowerCase()
  let programme = ''
  certificateCode = certificateCode || ''

  if(operation === 'add' || operation === 'edit'){
    const certificates = await certificateModel.find({ })
    certificateCode = generateCode(certificates, 'certificate', courseCode)
    programme = await coursesModel.find({ courseCode })
    programme = { ...programme._doc }
    programme = programme.course
  }

  switch (operation) {
    case 'add':
      try {
        const student = await userModel.findOne({ studentNumber })
        if(!student) return res.json({ status: 403, msg: 'No student found' })
        const name = student.firstname + ' ' + ( student.middlename ?? '' ) + ' ' + student.surname
        const saveCertificate = new certificateModel({
                                                      name,
                                                      studentNumber,
                                                      certificateCode,
                                                      programme,
                                                      dateCompleted
                                                    })
  
        await saveCertificate.save()
        if(!saveCertificate || !saveCertificate._id) return res.json({ status: 403, msg: 'Failed saving certificate' })
        return res.json({ status: 201, msg: `Certificate added with code ${certificateCode}` })
      } catch (err) {
        return res.json({ status: 500, msg: 'An error was encountered' })
      }
        break;
  
    case 'edit':
      if(!certificateCode) return res.json({ status: 403, msg: 'Enter certifcate id' })
      const updatedCertificate = await certificateModel.findOneAndUpdate({ courseCode },{ $set: { dateCompleted } })
        break;

    case 'delete': 
      try {
        if(!certificateCode) return res.json({ status: 403, msg: 'Enter certifcate id' })
        const deletedCertificate = await certificateModel.findOneAndDelete({ courseCode })
        if(!deletedCertificate) return res.json({ status: 403, msg: 'Failed deleting certificate' })
        return res.json({ status: 201, msg: 'Certificate deleted' })
      } catch (err) {
        return res.json({ status: 500, msg: 'Operation failed' })
      }
        break
  }

}
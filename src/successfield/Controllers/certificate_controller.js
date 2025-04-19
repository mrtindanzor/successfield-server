import { certificateModel, userModel, coursesModel, generateCode } from '../../core.js'

export default async function verify_controller(req, res){
  let { certificateCode } = req.body
  certificateCode = certificateCode.toLowerCase().trim()

  const certificate = await certificateModel.findOne({ certificateCode })
  if(!certificate) return res.json({ status: 403, msg: 'Invalid Certificate ID' })
  return res.json({ status: 200, certificate })
}

export async function certificate_operations(req, res) {
  const failed = []
  const { certificates, operation } = req.body

  if(operation === 'findCertificate'){
    const {  studentNumber } = req.body
    const findCertificates = await certificateModel.find({ studentNumber })
    if(findCertificates.length < 1) return res.json({ status: 403, msg: `No certificate associated to Student number: ${studentNumber}` })
    return res.json({ status: 200, findCertificates })
  }

  for(const certificate of certificates){
    let {
      courseCode,
      studentNumber,
      dateCompleted,
      certificateCode
    } = certificate

    const oldCertificateCode = certificate.certificateCode

    if(!courseCode || !studentNumber || !dateCompleted){
      failed.push({
        courseCode: courseCode || '',
        studentNumber: studentNumber || '',
        dateCompleted: dateCompleted || '',
        certificateCode: certificateCode || '',
        reason: 'All fields required'
      })

      continue
    }

    studentNumber = studentNumber.toLowerCase().trim()
    courseCode = courseCode.trim().toLowerCase()
    dateCompleted = dateCompleted.trim().toLowerCase()
    if(certificateCode) certificateCode = certificateCode.trim().toLowerCase()
    let programme = ''
    let student = ''
    certificateCode = certificateCode || ''

    try{
      student = await userModel.findOne({ studentNumber })
      if(!student){
        failed.push({ ...certificate, reason: "Invalid student id" })
        continue
      }
    } catch(err){
      failed.push({ ...certificate, reason: 'an error was encountered' })
      constinue
    }

    if(operation === 'add' || operation === 'edit'){
      const certificates = await certificateModel.find({ })
      certificateCode = generateCode(certificates, 'certificate', courseCode)
      programme = await coursesModel.find({ courseCode })
      if(!programme){
        failed.push({ ...certificate, reason: 'invalid course code' })
        continue
      }
      programme = { ...programme._doc }
      programme = programme.course
    }
    
    const { firstname, middlename, surname } = student
    const name = `${firstname} ${ middlename ?? '' } ${surname}`
    const newCertificate = {
      name,
      studentNumber,
      certificateCode,
      programme,
      dateCompleted
    }

    switch (operation) {
    case 'add':
      try {
        const saveCertificate = new certificateModel( newCertificate )

        await saveCertificate.save()
        if(!saveCertificate || !saveCertificate._id) {
          failed.push({ ...certificate, reason: 'error saving certificate' })
          continue
        }
      } catch (err) {
        failed.push({ ...certificate, reason: 'an error was encountered' })
      }

    case 'edit':
      if(!certificateCode){
        failed.push({ ...certificate, reason: "invalid certificate id" })
        continue
      }
      const updatedCertificate = await certificateModel.findOneAndUpdate({ certificateCode: oldCertificateCode }, newCertificate, { new: true })
      if(!updatedCertificate){
        failed.push({ ...certificate, reason: 'error updating certificate' })
      }
        break;

    case 'delete': 
      try {
        if(!certificateCode){
          return res.json({ status: 404, msg: 'no certificate code provided', failed: [{ ...certificate, reason: "No certificate code provided" }] })
        }
        const deletedCertificate = await certificateModel.findOneAndDelete({ certificateCode: oldCertificateCode })
        if(!deletedCertificate) return res.json({ status: 403, msg: 'Failed deleting certificate', failed: [{ ...certificate, reason: "Error performing delete" }] })
        return res.json({ status: 201, msg: 'Certificate deleted' })
      } catch (err) {
        return res.json({ status: 500, msg: 'Operation failed', failed: [{ ...certificate, reason: "An error occured" }] })
      }
  }

  }

  if(failed.length > 0) return res.json({ status: 403, msg: 'operation completed with some errors', failed })
  return res.json({ status: 201, msg: 'operations completed successfully' })
}
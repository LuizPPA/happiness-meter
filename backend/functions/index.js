const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://hapiness-meter.firebaseio.com/'
})

exports.post_rate = functions.https.onRequest(async (request, response) => {
  // Setting response headers
  response.set('Access-Control-Allow-Origin', "*")
  response.set('Access-Control-Allow-Methods', 'GET, POST')
  response.set('Access-Control-Allow-Headers', 'content-type')

  // Allowing preflight requests
  if (request.method === "OPTIONS") {
    response.status(200).send("OK")
    return
  }

  const user_rate = request.body.user_rate
  if (user_rate === undefined || user_rate.rate === undefined || user_rate.department === undefined) {
    return response.status(403).send('Please, provide the required info')
  }
  await admin.database().ref('/rates').push(user_rate)
  const email_data = await admin.database().ref('/emails')

  // let message = 'Um funcionário postou uma nova avaliação do ambiente de trabalho.'
  //
  // var email = {
  //   to: email_data.admin,
  //   subject: 'Nova avaliação de funcionário',
  //   text: message,
  //   html: '<p>'+message+'</p>'
  // }
  // var smtpConfig = {
  //   host: 'smtp.gmail.com',
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: email_data.sender,
  //     pass: email_data.sender_password
  //   }
  // }
  // let transporter = nodemailer.createTransport(smtpConfig)
  // transporter.sendMail(email)

  return response.status(200).send("OK")
})

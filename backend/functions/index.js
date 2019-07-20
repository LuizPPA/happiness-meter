const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const { google } = require("googleapis")
const OAuth2 = google.auth.OAuth2

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
  const user_rate = JSON.parse(request.body)
  if (user_rate === undefined || user_rate.rate === undefined || user_rate.department === undefined) {
    return response.status(403).send('Please, provide the required info')
  }
  await admin.database().ref('/rates').push(user_rate)
  response.status(200).send("OK")
})

const resume = async () => {

}

exports.resume_http = functions.https.onRequest(async (request, response) => {
  // Setting response headers
  response.set('Access-Control-Allow-Origin', "*")
  response.set('Access-Control-Allow-Methods', 'GET, POST')
  response.set('Access-Control-Allow-Headers', 'content-type')

  // Allowing preflight requests
  if (request.method === "OPTIONS") {
    response.status(200).send("OK")
    return
  }

  await admin.database().ref('/emails').once('value',
    async email_data_str => {
      email_data = JSON.parse(JSON.stringify(email_data_str))
      const sender = email_data.sender
      let message = 'Um funcionário postou uma nova avaliação do ambiente de trabalho.'
      let email = {
        to: email_data.admin,
        subject: 'Nova avaliação de funcionário',
        text: message,
        html: `<p>${message}</p>`
      }
      const oauth2_client = new OAuth2(sender.oauth.client_id, sender.oauth.key, 'https://developers.google.com/oauthplayground')
      oauth2_client.setCredentials({refresh_token: sender.oauth.refresh_token})
      const oauth_token = await oauth2_client.getAccessToken().catch(error => {
        return response.status(400).send(error)
      })
      // return response.status(200).send(tokens)
      const access_token = oauth_token.token
      let smtp_config = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          type: 'OAuth2',
          user: sender.email,
          pass: sender.password,
          clientId: sender.oauth.client_id,
          clientSecret: sender.oauth.key,
          refreshToken: sender.oauth.refresh_token,
          accessToken: access_token
        }
      }
      let transporter = nodemailer.createTransport(smtp_config)
      await transporter.sendMail(email).catch( error => {
        response.status(400).send(error)
        return
      })
      response.status(200).send("OK")
    },
    error => {
      response.status(400).send(error)
    }
  )
})

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

exports.resume = functions.https.onRequest(async (request, response) => {
  // Setting response headers
  response.set('Access-Control-Allow-Origin', "*")
  response.set('Access-Control-Allow-Methods', 'GET, POST')
  response.set('Access-Control-Allow-Headers', 'content-type')

  // Allowing preflight requests
  if (request.method === "OPTIONS") {
    response.status(200).send("OK")
    return
  }

  let rates_resume = {
    average_rates: [],
    responses: []
  }

  await admin.database().ref('/rates').once('value',
    async rate_data_str => {
      let rate_data = JSON.parse(JSON.stringify(rate_data_str))
      Object.keys(rate_data).forEach(rate_key => {
        let rate_instance = rate_data[rate_key]
        rates_resume.responses.push(rate_instance)
        let department_group = rates_resume.average_rates.find(rate_group => {
          return rate_group.department === rate_instance.department
        })
        if(department_group === undefined){
          department_group = {
            department: rate_instance.department,
            rate: rate_instance.rate,
            total: 1
          }
          rates_resume.average_rates.push(department_group)
        }
        else{
          department_group.rate += rate_instance.rate
          department_group.total += 1
        }
      })
      rates_resume.average_rates.forEach(average_rate => {
        average_rate.rate = average_rate.rate/average_rate.total
      })
      return response.status(200).send(rates_resume)
    }
  )
})

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
      let email_data = JSON.parse(JSON.stringify(email_data_str))
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

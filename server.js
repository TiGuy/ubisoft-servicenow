'use strict'
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')

function requireEnvVariable(name) {
  var value = process.env[name];
  if(!value) {
    throw new Error(name + ' is required!');
  }
  return value;
}

var OAuthURL = requireEnvVariable('OAuthURL')
var ClientID = requireEnvVariable('ClienID')
var ClientSecret = requireEnvVariable('ClientSecret')
var RequestURL = requireEnvVariable('RequestURL')
var IncidentURL = requireEnvVariable('IncidentURL')
var APIUsername = requireEnvVariable('APIUsername')
var APIPassword = requireEnvVariable('APIPassword')

var request = require('request')

var options = {
  method: 'POST',
  url: OAuthURL,
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'cache-control': 'no-cache',
  },
  form: {
    grant_type: 'password',
    client_id: CLientID,
    client_secret: ClientSecret,
    username: APIUsername,
    password: APIPassword
  }
}


if (!process.env.PORT) throw Error('PORT missing but required')

var slapp = Slapp({
  record: 'out.jsonl',
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})

require('beepboop-slapp-presence-polyfill')(slapp, { debug: true })

var app = slapp.attachToExpress(express())
slapp.message('CreateRequest (.*)', 'direct_message', (msg, text, match1) => {
  slapp.client.users.info({token: msg.meta.bot_token, user: msg.body.event.user}, (err, data) => {
    msg.say({
      text: 'Are you sure you want to create this Request?',
      attachments: [
        {
          mrkdwn_in: ['text', 'pretext'],
          text: '*Short Description:* Request created on Slack by ' + data.user.real_name + '\n *Description:* ' + match1,
          fallback: 'CreateRequest',
          callback_id: 'CreateRequest_callback',
          color: '#3AA3E3',
          actions: [
            { name: 'answer', text: 'Yes', type: 'button', value: [{response: 'yes', usr_realname: msg.body.event.user.name, description: match1, teamid: data.user.real_name}] },
            { name: 'answer', text: 'No',  type: 'button',  value: 'no' }
          ]
        }
      ]
    })
  })
})
slapp.route('handleCreateRequest', (msg, state) => {
  msg.say(':smile ' + state.what)
})

slapp.action('CreateRequest_callback', 'answer', (msg, value) => {
  if (value === 'yes') {
    msg.respond({
      text: '',
      attachments: [
          {
            mrkdwn_in: ['text', 'pretext'],
            fallback: "Required plain-text summary of the attachment.",
            color: "#2ab27b",
            text: 'Request <https://ubisoft.service-now.com/sos/request_item.do?sysparm_sys_id=9b9a6128db3066c49f8f785e0f9619a6|RTASK0341941> has been created.'
         }
      ]
    })
  }
  else {
    request(options)
    //msg.respond(msg.body.response_url, 'test ' + msg.body.original_message.text.attachments.text)
  }
})

app.get('/', function (req, res) {
  res.send('Hello')
})

request(options, function (error, response, body) {
    if (error) throw new Error(error)

    console.log(body)
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)

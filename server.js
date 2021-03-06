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
var access_token = ""
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
    client_id: ClientID,
    client_secret: ClientSecret,
    username: APIUsername,
    password: APIPassword,
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
            { name: 'answer', text: 'Yes', type: 'button', value: data.user.real_name + '¤' + match1 },
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
  if (value === 'no') {
    msg.respond({
      text: '',
      attachments: [
          {
            mrkdwn_in: ['text', 'pretext'],
            fallback: "Required plain-text summary of the attachment.",
            color: "#e60000",
            text: 'Request creation cancelled.'
         }
      ]
    })
  }
  else {
    msg.respond({
      text: '',
      attachments: [
          {
            mrkdwn_in: ['text', 'pretext'],
            fallback: "Required plain-text summary of the attachment.",
            color: "#3AA3E3",
            text: 'Processing request...'
         }
      ]
    })
    console.log(value)
    var data = value.split("¤")
    request(options, function(error, response, body){
        if(response.statusCode === 200) {
            var tmp = JSON.parse(body)
            access_token = tmp.access_token


            var ticketoptions = {
              method: 'POST',
              url: RequestURL,
              headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + access_token,
                'cache-control': 'no-cache',
              },
              json: {
                'requested_for': data[0],
                'u_category': 'Other > Other > Other Request',
                'short_description': 'Request created on Slack by ' + data[0],
                'description': data[1],
                'assignment_group': 'IT-QUE Service Technique',
              }
            }
            request(ticketoptions, function(error, response, body){
              console.log(response)
              if(response.statusCode === 201) {
                msg.respond({
                  text: '',
                  attachments: [
                      {
                        mrkdwn_in: ['text', 'pretext'],
                        fallback: "Required plain-text summary of the attachment.",
                        color: "#2ab27b",
                        text: 'Request <' + body.result[4] + '|' + body.result[2].substring(10) + '> has been created. You can click on the link to add watchers or file attachments'
                     }
                  ]
                })
              }
              else {
                msg.respond({
                  text: '',
                  attachments: [
                      {
                        mrkdwn_in: ['text', 'pretext'],
                        fallback: "Required plain-text summary of the attachment.",
                        color: "#e60000",
                        text: 'Error during Request creation.'
                     }
                  ]
                })
              }
            })
          }
        })
      }
    })


console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)

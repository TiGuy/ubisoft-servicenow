'use strict'
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
if (!process.env.PORT) throw Error('PORT missing but required')

var slapp = Slapp({
  record: 'out.jsonl',
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})

require('beepboop-slapp-presence-polyfill')(slapp, { debug: true })

var app = slapp.attachToExpress(express())
slapp.message('CreateRequest (.*)', 'direct_message', (msg, text, match1) => {
  var userinfo = slapp.client.users.info({token: msg.meta.app_token, user: msg.body.event.user}, (err, data) => {})
    msg.say({
      text: 'Are you sure you want to create this Request?',
      attachments: [
        {
          mrkdwn_in: ['text', 'pretext'],
          text: '*Short Description:* Request created on Slack by ' + userinfo.user.real_name + '\n *Description:* ' + match1,
          fallback: 'CreateRequest',
          callback_id: 'CreateRequest_callback',
          color: '#3AA3E3',
          actions: [
            { name: 'answer', text: 'Yes', type: 'button', value: 'yes' },
            { name: 'answer', text: 'No',  type: 'button',  value: 'no' }
          ]
        }
      ]
    })
  })

slapp.route('handleCreateRequest', (msg, state) => {
  msg.say(':smile ' + state.what)
})

slapp.message('yesno', (msg) => {
  msg.say({
      text: '',
      attachments: [
        {
          text: '',
          fallback: 'Yes or No?',
          callback_id: 'yesno_callback',
          actions: [
            { name: 'answer', text: 'Yes', type: 'button', value: 'yes' },
            { name: 'answer', text: 'No',  type: 'button',  value: 'no' }
          ]
        }]
      })
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
            text: "Request <https://ubisoft.service-now.com/sos/request_item.do?sysparm_sys_id=9b9a6128db3066c49f8f785e0f9619a6|RTASK0341941> has been created."
         }
      ]
    })
  }
  else {msg.respond(msg.body.response_url, `Cancelled ticket creation.`)}
})

app.get('/', function (req, res) {
  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)

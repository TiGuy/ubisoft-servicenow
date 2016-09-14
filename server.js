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
  msg.say({
    text: 'Are you sure you want to create this Request?',
    attachments: [
      {
        mrkdwn_in: ['text', 'pretext'],
        text: '*Short Description:* Request created on Slack by ' + msg.body.event.user + '\n *Description:* ' + match1,
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
    msg.say({
      text: '',
      attachments: [
          {
            mrkdwn_in: ['text', 'pretext'],
            fallback: "Required plain-text summary of the attachment.",
            color: "#2ab27b",
            text: "Request <https://ubisoft.service-now.com/nav_to.do?uri=%2Fsc_task.do%3Fsys_id%3D8cc10baedb3966409f8f785e0f9619e3%26sysparm_view%3Dcatalog%26sysparm_record_target%3Dsc_task%26sysparm_record_row%3D4%26sysparm_record_rows%3D23%26sysparm_record_list%3Du_avis_notice%253D%255Eassignment_groupDYNAMICjavascript%253AgetMyGroups%2528%2529%255EstateNOT%2BIN3%252C66%252C77%252C6%255Eactive%253Dtrue%255EORDERBYDESCdue_date|RTASK0341941> has been created."
         }
      ]
    })
  }
  else {msg.respond(msg.body.response_url, `${value} is a bad choice!`)}
})

app.get('/', function (req, res) {
  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)

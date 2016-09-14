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
  if (value === 'yes') {msg.respond(msg.body.response_url, `${value} is a good choice!`)}
  else {msg.respond(msg.body.response_url, `${value} is a bad choice!`)}
})

app.get('/', function (req, res) {
  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)

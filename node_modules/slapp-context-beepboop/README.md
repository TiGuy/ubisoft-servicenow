# slapp-context-beepboop
Slapp context lookup module for running on Beep Boop

This is an implementation of a context middleware function for 
[slapp](https://github.com/BeepBoopHQ/slapp) for Slack apps running on
[Beep Boop](https://beepboophq.com).  It populates the `req.slapp.meta` object with the following properties, which are pulled from HTTP headers from [Beep Boop](https://beepboophq.com):

+ `app_token`
+ `app_user_id`
+ `bot_token`
+ `bot_user_id`
+ `bot_user_name`
+ `team_name`
+ `team_domain`

## Install

```
npm install --save slapp-context-beepboop
```

## Use

```
const Slapp = require('slapp')
const BeepBoopContext = require('slapp-context-beepboop')

var slapp = Slapp({
  context: BeepBoopContext(),
})
```

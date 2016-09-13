# beepboop-slapp-presence-polyfill
Presence pollyfil for Beep Boop Slapp apps

[Slapp](https://github.com/BeepBoopHQ/slapp) Slack Apps favor the HTTP based integrations from the Slack API over the socket-based RTM, such as [Slack Events](https://api.slack.com/events-api), [Slash Commands](https://api.slack.com/slash-commands) and [Interactive Messages](https://api.slack.com/docs/slack-button).  Currently (8/19/2016) there's no way to have your bot user show as online unless you're using an RTM connection.  Until Slack has a solution for this, this module allows your Slapp apps to have a bot user that shows as online when running on [Beep Boop](https://beepboophq.com).  We accomplish this by integrating our Multi-Team Socket Mode feature in Beep Boop, and creating an RTM connection for each team, which causes your bot to show as online 💚.

While this is definitely not optimal, as it creates an un-used RTM connection, it's meant as a temporary stop-gap until there is an official solution from Slack.

## Install

```
npm install --save beepboop-slapp-presence-polyfill
```

## Usage

Make sure you enable Multi-Team Socket Mode on your project, then plug this library into your Slapp app.

![image](https://cloud.githubusercontent.com/assets/367275/17818725/f983dff8-6601-11e6-8911-cf3539e02a3a.png)

```javascript
var Slapp = require('slapp')

var slapp = Slapp(
  // ..slapp options
)

// default options
require('beepboop-slapp-presence-polyfill')(slapp)

// enable debugging
require('beepboop-slapp-presence-polyfill')(slapp, {
  debug: true
})
```

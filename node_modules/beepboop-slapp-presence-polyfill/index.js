const BeepBoopSlack = require('beepboop-smallwins-slack')

module.exports = (slapp, config) => {
  if (!slapp || !slapp.client) {
    console.log('Invalid slapp instance provided. Not starting Beep Boop Slapp Presence Polyfill 😶')
    return
  }

  config = config || {}

  // Only run the presence polyfill if we have resourcer config
  var runPolyfill = config.serverUrl || process.env.BEEPBOOP_RESOURCER

  if (!runPolyfill) {
    console.log("No BEEPBOOP_RESOURCER environment variable, make sure you've enabled Multi-team Socket Mode. Not starting Beep Boop Slapp Presence Polyfill 😶")
    return
  }

  console.log('Starting Beep Boop Slapp Presence Polyfill 😘')
  BeepBoopSlack.start(slapp.client, config)
}


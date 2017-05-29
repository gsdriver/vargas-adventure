'use strict';

const Alexa = require('alexa-sdk');
const Launch = require('./intents/Launch');

const APP_ID = 'amzn1.ask.skill.8fb6e399-d431-4943-a797-7a6888e7c6ce';

// Handlers for our skill
const handlers = {
  'NewSession': function() {
    if (this.event.request.type === 'IntentRequest') {
      this.emit(this.event.request.intent.name);
    } else {
      console.log('New session started: Launch');
      this.emit('LaunchRequest');
    }
  },
  // Start the game
  'LaunchRequest': Launch.handleIntent,
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t get that. Please try again.', 'Please try saying something again.');
  },
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);

  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

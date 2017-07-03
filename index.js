'use strict';

const Alexa = require('alexa-sdk');
const Launch = require('./intents/Launch');
const Select = require('./intents/Select');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');

const APP_ID = 'amzn1.ask.skill.8fb6e399-d431-4943-a797-7a6888e7c6ce';

// Handlers for our skill
const selectStoryHandlers = Alexa.CreateStateHandler('SELECTSTORY', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.YesIntent': Select.handleYesIntent,
  'AMAZON.NoIntent': Select.handleNoIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t recognize that. Try saying Yes.', 'Sorry, I didn\'t recognize that. Try saying Yes.');
  },
});

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
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.YesIntent': Select.handleYesIntent,
  'AMAZON.NoIntent': Select.handleNoIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t get that. Please try again.', 'Please try saying something again.');
  },
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers, selectStoryHandlers);
  alexa.execute();
};

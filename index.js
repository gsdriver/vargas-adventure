'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const Launch = require('./intents/Launch');
const Select = require('./intents/Select');
const Choice = require('./intents/Choice');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');

const APP_ID = 'amzn1.ask.skill.b45ecc7b-7cb8-4a5d-9452-53cfbd46513d';

// Handlers for our skill
const endStoryHandlers = Alexa.CreateStateHandler('ENDSTORY', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'AMAZON.YesIntent': Select.handleYesIntent,
  'AMAZON.NoIntent': Exit.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t recognize that. Try saying Yes.', 'Sorry, I didn\'t recognize that. Try saying Yes.');
  },
});

const inStoryHandlers = Alexa.CreateStateHandler('INSTORY', {
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'SelectIntent': Select.handleIntent,
  'ChoiceIntent': Choice.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    this.emit(':saveState', true);
  },
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t recognize that. Try saying Yes.', 'Sorry, I didn\'t recognize that. Try saying Yes.');
  },
});

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
  'SelectIntent': Launch.handleIntent,
  'ChoiceIntent': Launch.handleIntent,
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
  AWS.config.update({region: 'us-east-1'});

  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;
  alexa.dynamoDBTableName = 'VargasStories';
  alexa.registerHandlers(handlers, endStoryHandlers, inStoryHandlers, selectStoryHandlers);
  alexa.execute();
};

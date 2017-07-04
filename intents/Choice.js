//
// Handles choosing a path in the story
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // The bet amount is optional - if not present we will use a default value
    // of either the last bet amount or 1 unit
    let reprompt = 'What can I help you with?';
    let speech;
    let error;
    const choiceSlot = this.event.request.intent.slots.Choice;
    let choice;

    // First, we have to be in a story that has choices
    if (!this.attributes.currentSection) {
      error = 'Sorry, you must first select a story to read.';
    } else if (!this.attributes.currentSection.choices
        || !this.attributes.currentSection.choices.length) {
      error = 'You are at the end of the story!';
    } else if (!choiceSlot || !choiceSlot.value) {
      error = 'I didn\'t hear a selection.';
    } else {
      choice = parseInt(choiceSlot.value);
      if (isNaN(choice) ||
          (choice > this.attributes.currentSection.choices.length)) {
        error = 'Sorry, ' + choiceSlot.value + ' is not a valid option.';
      }
    }

    if (!error) {
      // OK, a valid choice has been made - so let's go to that branch
      const section = utils.findSection(this.attributes.fullStory,
            this.attributes.currentSection.choices[choice - 1]);

      if (section) {
        this.attributes.currentSection = section;
        speech = section.text;

        // If this is the end of the story, terminate
        if (section.reprompt) {
          reprompt = section.reprompt;
        } else {
          this.attributes.stories = [this.attributes.currentStory];
          reprompt = 'Would you like to start this story again?';
          this.handler.state = 'ENDSTORY';
        }
      } else {
        // No section found?  We need to do error detection upfront
        error = 'Sorry, I couldn\'t load that option.';
      }
    }

    if (error) {
      error += (' ' + reprompt);
    }
    if (speech) {
      speech += (' ' + reprompt);
    }

    utils.emitResponse(this.emit, error, null, speech, reprompt);
  },
};

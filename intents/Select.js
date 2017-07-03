//
// Handles selecting a story
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    let speech;
    let reprompt;

    // Read the available stories then prompt for each one
    const storyList = [];

    for (const story in this.attributes.stories) {
      if (stories.hasOwnProperty(story)) {
        storyList.push(story);
      }
    }

    if (storyList.length) {
      speech += 'We have the following available stories: ';
      speech += speechUtils.and(storyList);
      speech += '. ';
      reprompt = 'Would you like to read ' + storyList[0] + '?';
    } else {
      reprompt = 'What can I help you with?';
    }

    // Ask for the first one
    speech += reprompt;
    utils.emitResponse(this.emit, null, null, speech, reprompt);
  },
  handleYesIntent: function() {
    // Great, they picked a story
    this.handler.state = 'INSTORY';
    selectedStory(this.emit, this.attributes);
  },
  handleNoIntent: function() {
    // OK, pop this choice and go to the next one - if no other choices, we'll go with the last one
    this.attributes.stories.shift();
    if (this.attributes.stories.length === 1) {
      // OK, we're going with this one
      this.handler.state = 'INSTORY';
      selectedGame(this.emit, this.attributes);
    } else {
      const speech = 'Would you like to read ' + storyList[0] + '?';

      utils.emitResponse(this.emit, null, null, speech, speech);
    }
  },
};

function selectedStory(emit, attributes) {
  let speech;
  let reprompt;

  // Great, they picked a story
  attributes.currentStory = attributes.stories[0];
  attributes.stories = undefined;
  speech = 'Welcome to the ' + attributes.currentStory + ' story. ';
  utils.loadStory(attributes.currentStory,
      attributes.storyDetails[attributes.currentStory],
      (err, results) => {
    if (err) {
      speech = 'Sorry, I couldn\'t open the ' + attributes.currentStory + ' story. ';
      reprompt = 'What can I help you with?';
      speech += reprompt;
    } else {
      attributes.fullStory = results;
      reprompt = 'What would you like to do?';
      speech += utils.getStoryText(results, 'start.txt');
    }

    utils.emitResponse(emit, null, null, speech, reprompt);
  });
}

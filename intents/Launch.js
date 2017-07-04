//
// Handles launching the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handleIntent: function() {
    // Load the list of available stories
    utils.getStoryList((err, storyDetails) => {
      let speech = 'Welcome to the Vargas Family Adventure. ';
      const stories = [];
      let reprompt;

      for (const story in storyDetails) {
        if (storyDetails.hasOwnProperty(story)) {
          stories.push(story);
        }
      }

      if (stories.length) {
        speech += 'We have the following available stories: ';
        speech += speechUtils.and(stories);
        speech += '. ';
        reprompt = 'Would you like to read ' + stories[0] + '?';
      } else {
        reprompt = 'What can I help you with?';
      }

      speech += reprompt;
      this.attributes.storyDetails = storyDetails;
      this.attributes.stories = stories;
      this.handler.state = 'SELECTSTORY';
      this.emit(':ask', speech, 'Come back later!');
    });
  },
};


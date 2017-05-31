//
// Handles launching the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handleIntent: function() {
    // Load the list of available stories
    utils.getStoryList((err, data) => {
      let speech = 'Welcome to the Vargas Family Adventure. ';
      const stories = [];

      for (const story in data) {
        if (data.hasOwnProperty(story)) {
          stories.push(story);
        }
      }

      if (stories.length) {
        speech += 'We have the following available stories: ';
        speech += speechUtils.and(stories);
        speech += '. ';
      }

      speech += 'We are still working on this game!';
      this.emit(':ask', speech, 'Come back later!');
    });
  },
};


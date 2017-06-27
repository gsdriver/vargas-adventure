//
// Handles launching the skill
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handleIntent: function() {
    // Load the list of available stories
    utils.getStoryList((err, stories) => {
      let speech = 'Welcome to the Vargas Family Adventure. ';
      const storyList = [];

      for (const story in stories) {
        if (stories.hasOwnProperty(story)) {
          storyList.push(story);
//          utils.loadStory(story, stories[story], (err, results) => {
//            console.log(results);
//          });
        }
      }

      if (storyList.length) {
        speech += 'We have the following available stories: ';
        speech += speechUtils.and(storyList);
        speech += '. ';
      }

      speech += 'We are still working on this game!';
      this.attributes.stories = stories;
      this.emit(':ask', speech, 'Come back later!');
    });
  },
};


//
// Handles launching the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Load the list of available stories
    utils.getStoryList((err, data) => {
      if (data) {
        // Just list the stories for now
        console.log(data);
      }
      this.emit(':ask', 'Welcome to the Vargas Family Adenture, we are still working on this game!', 'Come back later!');
    });
  },
};


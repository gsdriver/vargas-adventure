//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    let speech;

    if (this.handler.state == 'SELECTSTORY') {
      // If selecting a game, help string is different
      const reprompt = 'Would you like to hear ' + this.attributes.stories[0] + '?';

      speech = reprompt;
      utils.emitResponse(this.emit, null, null, speech, reprompt);
    } else {
      // Make this contextual at some point
      utils.emitResponse(this.emit, null, null, 'Say the option you want to take', 'Say the option you want to take');
    }
  },
};

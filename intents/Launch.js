//
// Handles launching the skill
//

'use strict';

module.exports = {
  handleIntent: function() {
    this.emit(':ask', 'Welcome to the Vargas Family Adenture, we are still working on this game!', 'Come back later!');
  },
};

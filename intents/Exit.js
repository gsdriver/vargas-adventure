//
// Handles stop, which will exit the skill
//

'use strict';

const utils = require('../utils');
const ads = require('../ads');

module.exports = {
  handleIntent: function() {
    ads.getAd(this.attributes, 'stories', this.event.request.locale, (adText) => {
      utils.emitResponse(this.emit, this.event.request.locale,
        null, adText + ' Goodbye!', null, null);
    });
  },
};

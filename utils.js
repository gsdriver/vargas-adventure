//
// Handles launching the skill
//

'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({apiVersion: '2006-03-01', region: 'us-east-1'});

module.exports = {
  emitResponse: function(emit, error, response, speech, reprompt) {
    if (error) {
      console.log('Speech error: ' + error);
      emit(':ask', error, 'What else can I help with?');
    } else if (response) {
      emit(':tell', response);
    } else {
      emit(':ask', speech, reprompt);
    }
  },
  getStoryList: function(callback) {
    const keyList = [];

    // Loop thru to read in all keys
    (function loop(firstRun, token) {
      const params = {Bucket: 'vargas-family-stories', MaxKeys: 100};

      if (firstRun || token) {
        params.ContinuationToken = token;

        const listObjectPromise = S3.listObjectsV2(params).promise();
        return listObjectPromise.then((data) => {
          let i;

          for (i = 0; i < data.Contents.length; i++) {
            keyList.push(data.Contents[i].Key);
          }
          if (data.NextContinuationToken) {
            return loop(false, data.NextContinuationToken);
          }
        });
      }
    })(true, null).then(() => {
      // Success - now parse these into stories
      callback(null, turnListToHierarchy(keyList));
    }).catch((err) => {
      console.log('Error ' + err);
      callback(err, null);
    });
  },
  loadStory: function(story, sectionList, callback) {
    // Loads a full story
    const results = [];
    const sections = JSON.parse(JSON.stringify(sectionList));

    if (!sections || !sections.length) {
      callback('No files', null);
      return;
    }

    let sectionsToAdd = sections.length;
    (function addSection(sections) {
      if (sections.length === 0) {
        // All done!
        return;
      }

      const section = sections.pop();
      S3.getObject({Bucket: 'vargas-family-stories', Key: story + '/' + section}, (err, data) => {
        if (err) {
          // Oops, just abort the whole thing
          console.log(err, err.stack);
          callback(err, null);
        } else {
          // OK, let's read this in and split into an array
          const text = data.Body.toString('ascii');
          const choices = text.split('|');
          const result = {name: section};

          // If there is only one element to the file,
          // it is the spoken text with no choices
          // Otherwise, last element is repeat, second-to-last spoken text,
          // and first elements are the choices
          if (choices.length > 1) {
            result.reprompt = choices.pop();
            result.text = choices.pop();
            result.choices = choices;
          } else {
            result.text = choices.pop();
          }

          results.push(result);

          // Is that it?
          if (--sectionsToAdd === 0) {
            callback(null, results);
          }
        }
      });

      addSection(sections);
    })(sections);
  },
  findSection: function(fullStory, name) {
    let i;
    let section;

    for (i = 0; i < fullStory.length; i++) {
      if (fullStory[i].name.toLowerCase() === name.toLowerCase()) {
        // This is it!
        section = fullStory[i];
        break;
      }
    }

    return section;
  },
};

function turnListToHierarchy(keys) {
  const stories = {};
  let i;

  // First go thru the list and pull out all top-level stories
  // These are keys where the last character is a backslash
  for (i = 0; i < keys.length; i++) {
    if (keys[i].slice(-1) == '/') {
      // Top level - add it as a story
      stories[keys[i].slice(0, keys[i].length - 1)] = [];
    }
  }

  // Now go through the list again and add to the appropriate story
  for (i = 0; i < keys.length; i++) {
    const files = keys[i].split('/');

    if (files.length == 2) {
      if (files[1].length > 0) {
        stories[files[0]].push(files[1]);
      }
    }
  }

  return stories;
}

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
  loadStory: function(story, sections, callback) {
    // Loads a full story
    const results = [];

    if (!sections || !sections.length) {
      callback('No files', null);
      return;
    }

    (function addSection(sections) {
      if (sections.length === 0) {
        // All done!
        callback(null, results);
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

          // The spoken text is the last part of this file, the
          // earlier pieces are the choices
          result.text = choices.pop();
          result.choices = choices;
          results.push(result);
          addSection(sections);
        }
      });
    })(sections);
  },
  getStoryText: function(fullStory, branch) {
    let i;
    let storyText = '';

    for (i = 0; i < fullStory.length; i++) {
      if (fullStory[i].name.toLowerCase() === branch.toLowerCase()) {
        // This is it!
        storyText = fullStory[i].text;
        break;
      }
    }

    return storyText;
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

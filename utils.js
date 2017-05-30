//
// Handles launching the skill
//

'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = {
  getStoryList: function(callback) {
    const params = {Bucket: 'vargas-family-stories', MaxKeys: 100};
    const keyList = [];

    s3.listObjectsV2(params, (err, data) => {
      let stories;

      if (err) {
        console.log('Error listing stories: ' + err);
      } else {
        // OK, let's add to the list of keys
        let i;

        for (i = 0; i < data.Contents.length; i++) {
          keyList.push(data.Contents[i].Key);
        }

        stories = turnListToHierarchy(keyList);
      }

      callback(err, stories);
    });
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

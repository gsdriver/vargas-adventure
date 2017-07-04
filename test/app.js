var mainApp = require('../index');

const attributeFile = 'attributes.txt';
const userId = 'not-amazon';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function BuildEvent(argv)
{
  // Templates that can fill in the intent
  var select = {'name': 'SelectIntent', 'slots': {}};
  var choice = {'name': 'ChoiceIntent', 'slots': {'Choice': {'name': 'Choice', 'value': ''}}};
  var helpIntent = {"name": "AMAZON.HelpIntent", "slots": {}};
  var exitIntent = {"name": "SessionEndedRequest", "slots": {}};
  var yes = {'name': 'AMAZON.YesIntent', 'slots': {}};
  var no = {'name': 'AMAZON.NoIntent', 'slots': {}};
  var help = {'name': 'AMAZON.HelpIntent', 'slots': {}};
  var stop = {'name': 'AMAZON.StopIntent', 'slots': {}};
  var cancel = {'name': 'AMAZON.CancelIntent', 'slots': {}};

  var lambda = {
     "session": {
       "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
       "application": {
         "applicationId": "amzn1.ask.skill.b45ecc7b-7cb8-4a5d-9452-53cfbd46513d"
       },
       "attributes": {},
      "user": {
         "userId": userId
       },
       "new": false
     },
     "request": {
       "type": "IntentRequest",
       "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
       "locale": "en-US",
       "timestamp": "2016-11-03T21:31:08Z",
       "intent": {}
     },
     "version": "1.0"
   };

  var openEvent = {
     "session": {
       "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
       "application": {
         "applicationId": "amzn1.ask.skill.b45ecc7b-7cb8-4a5d-9452-53cfbd46513d"
       },
       "attributes": {},
       "user": {
         "userId": userId
       },
       "new": true
     },
     "request": {
       "type": "LaunchRequest",
       "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
       "locale": "en-US",
       "timestamp": "2016-11-03T21:31:08Z",
       "intent": {}
     },
     "version": "1.0"
  };

  // If there is an attributes.txt file, read the attributes from there
  const fs = require('fs');
  if (fs.existsSync(attributeFile)) {
    data = fs.readFileSync(attributeFile, 'utf8');
    if (data) {
      lambda.session.attributes = JSON.parse(data);
      openEvent.session.attributes = JSON.parse(data);
    }
  }

  // If there is no argument, then we'll just ask for the rules
  if ((argv.length <= 2) || (argv[2] == 'launch')) {
    // Return the launch request
    return openEvent;
  } else if (argv[2] == 'choice') {
    lambda.request.intent = choice;
    if (argv.length > 3) {
      choice.slots.Choice.value = argv[3];
    }
  } else if (argv[2] == 'select') {
    lambda.request.intent = select;
  } else if (argv[2] == 'yes') {
    lambda.request.intent = yes;
  } else if (argv[2] == 'no') {
    lambda.request.intent = no;
  } else if (argv[2] == 'help') {
    lambda.request.intent = help;
  } else if (argv[2] == 'stop') {
    lambda.request.intent = stop;
  } else if (argv[2] == 'cancel') {
    lambda.request.intent = cancel;
  } else {
    console.log(argv[2] + ' was not valid');
    return null;
  }

  return lambda;
}


// Simple response - just print out what I'm given
function myResponse(appId) {
  this._appId = appId;
}

myResponse.succeed = function(result) {
  if (result.response.outputSpeech.ssml) {
    console.log('AS SSML: ' + result.response.outputSpeech.ssml);
  } else {
    console.log(result.response.outputSpeech.text);
  }
  if (result.response.card && result.response.card.content) {
    console.log('Card Content: ' + result.response.card.content);
  }
  console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
  if (result.sessionAttributes) {
    // Output the attributes too
    const fs = require('fs');
    fs.writeFile(attributeFile, JSON.stringify(result.sessionAttributes), (err) => {
      if (!process.env.NOLOG) {
        console.log('attributes:' + JSON.stringify(result.sessionAttributes) + ',');
      }
    });
  }
}

myResponse.fail = function(e) {
  console.log(e);
}

// Build the event object and call the app
if ((process.argv.length == 3) && (process.argv[2] == 'clear')) {
  const fs = require('fs');

  // Clear is a special case - delete this entry from the DB and delete the attributes.txt file
  dynamodb.deleteItem({TableName: 'VargasStories', Key: { userId: {S: 'not-amazon'}}}, function (error, data) {
    console.log("Deleted " + error);
    if (fs.existsSync(attributeFile)) {
      fs.unlinkSync(attributeFile);
    }
  });
} else {
  var event = BuildEvent(process.argv);
  if (event) {
      mainApp.handler(event, myResponse);
  }
}

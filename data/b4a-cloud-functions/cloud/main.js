const utilities = require('./utilities');
const generators = require ('./utilities/functions/generators.js');

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  let something = {
    msg: "hello there!!!",
    user: request.user ? request.user : 'no user!',
    rando: utilities.getRandomLetter(),
    something: utilities.someFunction(),
    game: generators.generateGame(),
  };
  response.success(something);
});

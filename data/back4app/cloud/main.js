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

Parse.Cloud.define("startGame", async function(request, response) {
  if (!request.user) return;

  // search for an existing game to join
  const GameObject = Parse.Object.extend("Games");
  let query = new Parse.Query(GameObject);
  let results = await query
    .doesNotExist("player2Id")
    .equalTo("turn", "p2")
    .notEqualTo("player1Id", request.user.id)
    .limit(1)
    .find({ useMasterKey: true });

  if (results.length > 0) {
    // join the existing game we just found
    let foundGame = results[0];
    const ACL = await foundGame.getACL()
      .setReadAccess(request.user.id, true);
    const joinSuccess = await foundGame
      .set("player2Id", request.user.id)
      .set("turn", request.user.id)
      .setACL(ACL)
      .save(null, { useMasterKey: true })
      .catch((err) => {
        response.error(err);
      });
    response.success(joinSuccess);

  } else {
    // start a new game
    const gameData = generators.generateGame(request.user.id);
    const game = await new GameObject()
      .set("player1Id", request.user.id)
      .set("turn", request.user.id)
      .set("history", gameData.h)
      .setACL(new Parse.ACL({
        '*': {},
        [request.user.id]: { "read": true }
      }))
      .save(null, { useMasterKey: true })
      .catch( (err) => {
        response.error(err);
      });
    response.success(game);
  }
});
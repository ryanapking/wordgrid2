const utilities = require('./utilities');
const generators = require ('./utilities/functions/generators.js');

Parse.Cloud.define("saveMove", async function(request) {

});

Parse.Cloud.define("startGame", async function(request) {
  if (!request.user) return;

  const GameObject = Parse.Object.extend("Games");
  let newGame = null;

  // search for an existing game to join
  let existingGames = await new Parse.Query(GameObject)
    .equalTo("status", "waiting")
    .notEqualTo("player1", request.user)
    .limit(1)
    .find({ useMasterKey: true });

  // join the existing game we just found
  if (existingGames.length > 0) {
    newGame = existingGames[0];
    const ACL = newGame.getACL()
      .setReadAccess(request.user.id, true);
    newGame
      .set("player2", request.user)
      .set("turn", request.user)
      .set("status", "in progress")
      .setACL(ACL);

  // start a new game
  } else {
    const gameData = generators.generateGame();
    newGame = new GameObject()
      .set("player1", request.user)
      .set("turn", request.user)
      .set("history", gameData.h)
      .set("status", "new")
      .setACL(new Parse.ACL({
        '*': {},
        [request.user.id]: { "read": true }
      }));
  }

  // save the game
  let returnValue = await newGame
    .save(null, { useMasterKey: true})
    .catch( (err) => {
      throw new Error(err);
    });

  return returnValue;

});
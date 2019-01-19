const utilities = require('./utilities');
const generators = require ('./utilities/functions/generators.js');

Parse.Cloud.define("startGame", async function(request, response) {
  if (!request.user) return;

  const GameObject = Parse.Object.extend("Games");
  const GameLists = Parse.Object.extend("GameLists");
  let newGame = null;
  let gameList = null;
  let updatedUser = null;

  // search for an existing game to join
  let results = await new Parse.Query(GameObject)
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
    newGame = await foundGame
      .set("player2Id", request.user.id)
      .set("turn", request.user.id)
      .setACL(ACL)
      .save(null, { useMasterKey: true })
      .catch((err) => {
        response.error(err);
      });

  } else {
    // start a new game
    const gameData = generators.generateGame();
    newGame = await new GameObject()
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
  }

  const gameListId = await request.user.get("gameListId");

  if (gameListId) {
    // load the existing game list and modify it
    gameList = await new Parse.Query(GameLists)
      .get(gameListId)
      .add("ready", newGame.id)
      .save(null, { useMasterKey: true })
      .catch( (err) => {
        response.error(err);
      });

  } else {
    // create a new game list
    gameList = await new GameLists()
      .add("ready", newGame.id)
      .setACL( new Parse.ACL({
        '*': {},
        [request.user.id]: { "read": true }
      }))
      .save(null, { useMasterKey: true })
      .catch( (err) => {
        response.error(err);
      });

    updatedUser = await request.user
      .set("gameListId", gameList.id)
      .save(null, { useMasterKey: true })
      .catch( (err) => {
        response.error(err);
      });

  }

  response.success({
    user: updatedUser ? updatedUser : request.user,
    gameList,
    newGame,
  });

});
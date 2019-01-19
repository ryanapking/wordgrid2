const utilities = require('./utilities');
const generators = require ('./utilities/functions/generators.js');

Parse.Cloud.define("startGame", async function(request, response) {
  if (!request.user) return;

  const GameObject = Parse.Object.extend("Games");
  const GameLists = Parse.Object.extend("GameLists");

  let saveUser = null;
  let newGame = null;
  let gameList = await request.user.get("gameList");

  if (!gameList) {
    // create a new game list
    gameList = new GameLists()
      .setACL( new Parse.ACL({
        '*': {},
        [request.user.id]: { "read": true }
      }));

    saveUser = request.user
      .set("gameList", gameList);
  }

  // search for an existing game to join
  let existingGames = await new Parse.Query(GameObject)
    .doesNotExist("player2Id")
    .equalTo("turn", "p2")
    .notEqualTo("player1Id", request.user.id)
    .limit(1)
    .find({ useMasterKey: true });

  if (existingGames.length > 0) {
    // join the existing game we just found
    let foundGame = results[0];
    const ACL = foundGame.getACL()
      .setReadAccess(request.user.id, true);
    newGame = await foundGame
      .set("player2Id", request.user.id)
      .set("turn", request.user.id)
      .setACL(ACL);

  } else {
    // start a new game
    const gameData = generators.generateGame();
    newGame = new GameObject()
      .set("player1Id", request.user.id)
      .set("turn", request.user.id)
      .set("history", gameData.h)
      .setACL(new Parse.ACL({
        '*': {},
        [request.user.id]: { "read": true }
      }));
  }

  gameList.add("ready", newGame);

  Parse.Object.saveAll([newGame, gameList, saveUser], {
    useMasterKey: true,
    success: (successResponse) => {
      response.success(successResponse);
    },
    error: (err) => {
      response.error(err);
    }
  });

});
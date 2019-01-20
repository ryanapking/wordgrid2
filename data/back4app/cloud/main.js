const utilities = require('./utilities');
const generators = require ('./utilities/functions/generators.js');

Parse.Cloud.define("startGame", async function(request) {
  if (!request.user) return;

  // our classes
  const GameObject = Parse.Object.extend("Games");
  const GameLists = Parse.Object.extend("GameLists");

  // values that will be saved at the end of function
  let saveUser = null;
  let newGame = null;
  let gameList = await request.user.get("gameList");

  // create a new game list if the user doesn't already have one
  if (!gameList) {
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

  // join the existing game we just found
  if (existingGames.length > 0) {
    newGame = existingGames[0];
    const ACL = newGame.getACL()
      .setReadAccess(request.user.id, true);
    newGame
      .set("player2Id", request.user.id)
      .set("turn", request.user.id)
      .setACL(ACL);

  // start a new game
  } else {
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

  // add the new game to the user's list as a pointer
  gameList.add("ready", newGame);

  // save everything
  let returnValue = await Parse.Object.saveAll([newGame, gameList, saveUser], {
    useMasterKey: true,
    error: (err) => {
      throw new Error(err);
    }
  });

  return returnValue;

});
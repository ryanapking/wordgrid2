const utilities = require('./utilities');
const generators = require ('./utilities/functions/generators.js');
const dataConversions = require('./utilities/functions/dataConversions');

Parse.Cloud.define("saveMove", async function(request) {
  if (!request.user) throw new Error('invalid user');

  const { gameID, move } = request.params;

  // get the game data from the database
  const GameObject = Parse.Object.extend("Games");
  let gameSourceData = await new Parse.Query(GameObject)
    .get(gameID, { useMasterKey: true })
    .catch( (err) => {
      throw new Error(err);
    });
  const players = {
    p1: gameSourceData.get("player1"),
    p2: gameSourceData.get("player2"),
  };
  const turn = gameSourceData.get("turn");
  const status = gameSourceData.get("status");

  // compare the current user's id to the database to confirm permissions
  const isTurn = (turn && request.user.id === turn.id);
  let currentPlayer = null;
  let opponent = null;
  if (players.p1 && request.user.id === players.p1.id) {
    currentPlayer = players.p1;
    opponent = players.p2;
  } else if (players.p2 && request.user.id === players.p2.id) {
    currentPlayer = players.p2;
    opponent = players.p1;
  }

  // reject invalid move attempts
  if (!currentPlayer || !isTurn) {
    throw new Error("get outta here");
  }

  // possible statuses:
  // "new" - set upon creation, will never be set to this on game save
  // "waiting" - after initial move, before a second player has joined
  // "in progress" - game is in progress
  // "abandoned" - may never exist. possible status for job that will review games.
  // "ended" - game has ended naturally

  let newStatus = (status === "new") ? "waiting" : "in progress";

  // need to validate the move before saving it

  // const game = dataConversions.remoteToLocal(gameSourceData.toJSON(), request.user.id);
  //
  // return game;

  let savedGame = await gameSourceData
    .set("turn", opponent)
    .set("status", newStatus)
    .set("nextPiece", generators.generatePiece(16, true))
    .add("history", move)
    .add("moves", move)
    .save(null, { useMasterKey: true })
    .catch( (err) => {
      throw new Error(err);
    });

  return savedGame;

});

Parse.Cloud.define("startGame", async function(request) {
  if (!request.user) throw new Error('invalid user');

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
      .set("status", "new")
      .set("player1Pieces", gameData.player1Pieces)
      .set("player2Pieces", gameData.player2Pieces)
      .set("startingBoard", gameData.startingBoard)
      .set("nextPiece", gameData.nextPiece)
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
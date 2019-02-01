const generators = require ('../utilities/functions/generators.js');
const dataConversions = require('../utilities/functions/dataConversions');
const validators = require('../utilities/functions/checks');
const applyMoves = require('../utilities/functions/applyMoves');

const saveMove =  async function(request) {
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
  let opponentPiecesFieldName = null;
  if (players.p1 && request.user.id === players.p1.id) {
    currentPlayer = players.p1;
    opponent = players.p2 ? players.p2 : null;
    opponentPiecesFieldName = "player2Pieces";
  } else if (players.p2 && request.user.id === players.p2.id) {
    currentPlayer = players.p2;
    opponent = players.p1;
    opponentPiecesFieldName = "player1Pieces";
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

  const game = dataConversions.remoteToLocal(gameSourceData.toJSON(), request.user.id);

  // validate the move before saving it
  const moveValid = validators.validateMove(request.user.id, game.sourceData, move);
  if (!moveValid) {
    throw new Error('invalid move!');
  }

  // repack the object provided with the request to prevent any data stuffing
  const moveToSave = {
    "w": move.w,
    "wv": move.wv,
    "wp": move.wp,
    "pr": move.pr,
    "p": request.user.id,
  };
  const moveLocalVersion = dataConversions.moveRemoteToLocal(moveToSave);

  // apply the move to see if there's a winner
  const nextGameState = applyMoves.applyMove(game.gameState, moveLocalVersion);

  // set a winner if there is one
  const winner = validators.getWinner(nextGameState);
  if (winner && players.p1.id === winner) {
    gameSourceData.set("winner", players.p1);
  } else if (winner && players.p2.id === winner) {
    gameSourceData.set("winner", players.p2);
  }

  const opponentNeedsPiece = (
    (opponent && opponent.id === nextGameState.player1Id && nextGameState.player1CurrentPiecesIndexes.length < 3)
    || (opponent && opponent.id === nextGameState.player2Id && nextGameState.player2CurrentPiecesIndexes.length < 3)
  );
  if (opponentNeedsPiece) {
    const opponentNextPiece = dataConversions.nextPieceStringToRemotePiece(game.nextPiece, moveToSave.w.length);
    gameSourceData.add(opponentPiecesFieldName, opponentNextPiece);
  }

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

};

module.exports = saveMove;
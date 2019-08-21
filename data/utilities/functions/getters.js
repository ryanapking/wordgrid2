const dataConversions = require('./dataConversions');
const applyMoves = require('./applyMoves');

function getAnimationData(game) {
  const move = dataConversions.moveRemoteToLocal(game.moves[game.moves.length - 1]);

  let gameStateBeforeMove = dataConversions.remoteToStartingGameState(game.sourceData);
  for (let i = 0; i < (game.moves.length - 1); i++) {
    gameStateBeforeMove = applyMoves.applyMove(gameStateBeforeMove, dataConversions.moveRemoteToLocal(game.moves[i]));
  }

  const gameStateAfterMove = game.gameState;

  let pieceStates = null;
  if (game.opponent.label === "p1") {
    pieceStates = {
      startPieces: gameStateBeforeMove.player1CurrentPieces,
      endPieces: gameStateAfterMove.player1CurrentPieces,
      startIndexes: gameStateBeforeMove.player1CurrentPiecesIndexes,
    };
  } else if (game.opponent.label === "p2") {
    pieceStates = {
      startPieces: gameStateBeforeMove.player2CurrentPieces,
      endPieces: gameStateAfterMove.player2CurrentPieces,
      startIndexes: gameStateBeforeMove.player2CurrentPiecesIndexes,
    };
  }

  let boardStates = {
    start: gameStateBeforeMove.boardState,
    between: applyMoves.getBoardMinusPiece(gameStateAfterMove.boardState, game.opponent.allPieces, move.placementRef),
    end: gameStateAfterMove.boardState,
  };

  return {
    boardStates,
    pieceStates,
    placementRef: move.placementRef,
    wordPath: move.wordPath,
    word: move.word,
    points: move.wordValue,
  };

}

module.exports = {
  getAnimationData,
};
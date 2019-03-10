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
      start: gameStateBeforeMove.player1CurrentPieces,
      end: gameStateAfterMove.player1CurrentPieces,
    };
  } else if (game.opponent.label === "p2") {
    pieceStates = {
      start: gameStateBeforeMove.player2CurrentPieces,
      end: gameStateAfterMove.player2CurrentPieces,
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

// searches the board for valid starting points (matching first letter)
// uses recursive findNextLetter to find the remainder of the word
function getWordPath(word, boardState) {
  const wordLetters = word.toLowerCase().split("");
  const firstLetter = wordLetters[0];
  const remainingLetters = wordLetters.slice(1);

  let returnPath = null;

  boardState.forEach( (row, rowIndex) => {
    row.forEach( (letter, columnIndex) => {

      if (letter === firstLetter) {
        const square = {rowIndex, columnIndex};
        const path = findNextLetter(square, remainingLetters, boardState, [square]);

        if (path) {
          returnPath = path;
        }

      }

    });
  });

  return returnPath;
}

// recursively finds a word based on a starting point
function findNextLetter(square, findLetters, boardState, path) {
  // return the full path if we've got it
  if (findLetters.length < 1) {
    return path;
  }

  // if the full path isn't built yet, search for the next square
  const { rowIndex, columnIndex } = square;
  const adjacentIndexes = [
    {rowIndex: rowIndex, columnIndex: columnIndex - 1},
    {rowIndex: rowIndex - 1, columnIndex: columnIndex - 1},
    {rowIndex: rowIndex - 1, columnIndex: columnIndex},
    {rowIndex: rowIndex - 1, columnIndex: columnIndex + 1},
    {rowIndex: rowIndex, columnIndex: columnIndex + 1},
    {rowIndex: rowIndex + 1, columnIndex: columnIndex + 1},
    {rowIndex: rowIndex + 1, columnIndex: columnIndex},
    {rowIndex: rowIndex + 1, columnIndex: columnIndex - 1},
  ];

  // filter adjacent indexes down to those that contain the next letter
  const firstLetter = findLetters[0];
  const matchingAdjacentSquares = adjacentIndexes.filter( ({rowIndex, columnIndex}) => {
    // confirm that the square is on the board
    if (rowIndex < 0 || rowIndex > 9 || columnIndex < 0 || columnIndex > 9) {
      return false;
    }

    // check if the letters match
    const adjacentLetter = boardState[rowIndex][columnIndex];
    if (adjacentLetter !== firstLetter) return false;

    // check if the square is already part of the path
    return !path.reduce( (usedStatus, pathSquare) => {
      return (usedStatus || (rowIndex === pathSquare.rowIndex && columnIndex === pathSquare.columnIndex));
    }, false);
  });

  // Return variable. Will only be set if a path is found to be fully valid.
  let newPath = false;

  // for all matching squares, explore the next one
  const remainingLetters = findLetters.slice(1);
  matchingAdjacentSquares.forEach( (foundSquare) => {
    // the recursive bit
    const currentPath = findNextLetter(foundSquare, remainingLetters, boardState, [...path, foundSquare]);
    if (currentPath) { // if current path is false, it's invalid somewhere
      newPath = currentPath;
    }
  });

  return newPath;

}

module.exports = {
  getAnimationData,
  getWordPath,
};
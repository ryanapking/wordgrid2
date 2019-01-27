const dataConversions = require('./dataConversions');
const { boardStringToArray, pieceStringToArray, placementRefStringToArray } = dataConversions;

function getAnimationData(game) {
  if (game.history.length < 1) return false;

  const start = game.history[game.history.length -2];
  const end = game.history[game.history.length - 1];
  const player = (end.p === game.p1) ? "p1" : "p2";

  const pieceStates = {
    start: start[player].map( (piece) => pieceStringToArray(piece)),
    end: end[player].map( (piece) => pieceStringToArray(piece)),
  };

  const placementRef = placementRefStringToArray(end.pr);

  let boardStates = {
    start: boardStringToArray(start.b),
    end: boardStringToArray(end.b),
  };

  boardStates.between = getBoardMinusPiece(boardStates.end, pieceStates.start, placementRef);

  const wp = end.wp.split("|");
  const wordPath = wp.map( (coordinateSet) => {
    const squareCoordinates = coordinateSet.split(",");
    return {
      rowIndex: parseInt(squareCoordinates[0]),
      columnIndex: parseInt(squareCoordinates[1])
    };
  });

  return {
    boardStates,
    pieceStates,
    placementRef,
    wordPath,
    word: end.w,
    points: end.wv,
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
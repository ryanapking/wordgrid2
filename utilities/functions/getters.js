import settings from '../config';
import { boardStringToArray, pieceStringToArray } from "./dataConversions";

// return a dumb object of scores as if they are baseball innings
export function getScoreBoard(game) {

  const emptyScoreObject = { p1: null, p2: null };

  const scores = game.h.reduce( (scores, move) => {

    let previousMove = scores[scores.length - 1];

    const lastScoreIndex = scores.length - 1;
    let player = null;

    if (!move.p) {
      return scores;
    } else if (move.p === game.p1) {
      player = "p1";
    } else if (move.p === game.p2) {
      player = "p2";
    } else {
      console.log('something is busted');
      return scores;
    }

    if (previousMove[player]) {
      return [
        ...scores,
        {...emptyScoreObject, [player]: move.wv }
      ];
    } else {
      scores[lastScoreIndex] = {...previousMove, [player]: move.wv};
      return scores;
    }

  }, [emptyScoreObject]);

  // if we are short, fill out the difference with empty inning objects
  // this allows the scoreboard to go into extra innings and also display the remaining moves
  const remainingTurnCount = settings.naturalTurns - scores.length;
  if (remainingTurnCount > 0) {
    let diffMakerUpper = new Array(remainingTurnCount).fill(emptyScoreObject);
    return [...scores, ...diffMakerUpper];
  } else {
    return scores;
  }

}

export function getAnimationData(game) {
  if (game.history.length < 1) return false;

  const start = game.history[game.history.length -2];
  const end = game.history[game.history.length - 1];
  const player = (end.p === game.p1) ? "p1" : "p2";

  const pieceStates = {
    start: start[player].map( (piece) => pieceStringToArray(piece)),
    end: end[player].map( (piece) => pieceStringToArray(piece)),
  };

  const pr = end.pr.split("|");
  const placementRef = {
    pieceIndex: parseInt(pr[0]),
    rowIndex: parseInt(pr[1]),
    columnIndex: parseInt(pr[2])
  };

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

function getBoardMinusPiece(boardArray, pieces, placementRef) {
  const piece = pieces[placementRef.pieceIndex];

  // create a copy of the board array
  let newBoardArray = boardArray.map( (row) => row.slice() );

  // remove each letter of the piece from the new board array
  piece.forEach( (row, rowIndex) => {
    row.forEach( (letter, columnIndex) => {
      if (letter) {
        const boardRowIndex = placementRef.rowIndex + rowIndex;
        const boardColumnIndex = placementRef.columnIndex + columnIndex;
        newBoardArray[boardRowIndex][boardColumnIndex] = "";
      }
    });
  });

  return newBoardArray;
}

// searches the board for valid starting points (matching first letter)
// uses recursive findNextLetter to find the remainder of the word
export function getWordPath(word, boardState) {
  const wordLetters = word.toLowerCase().split("");
  const firstLetter = wordLetters[0];
  const remainingLetters = wordLetters.slice(1);

  let returnPath = null;

  boardState.forEach( (row, rowIndex) => {
    row.forEach( (letter, columnIndex) => {

      if (letter === firstLetter) {
        const square = {rowIndex, columnIndex};
        const path = findNextLetter(square, remainingLetters, boardState);

        if (path) {
          returnPath = [square, ...path];
        }

      }

    });
  });

  return returnPath;
}

// recursively finds a word based on a starting point
function findNextLetter(square, findLetters, boardState, path = []) {
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

  const firstLetter = findLetters[0];
  const adjacentSquares = adjacentIndexes.filter( ({rowIndex, columnIndex}) => {
    if (rowIndex < 0 || rowIndex > 9 || columnIndex < 0 || columnIndex > 9) {
      return false;
    }
    const adjacentLetter = boardState[rowIndex][columnIndex];
    return (adjacentLetter === firstLetter);
  });

  let newPath = false;
  const remainingLetters = findLetters.slice(1);

  adjacentSquares.forEach( (foundSquare) => {
    const currentPath = findNextLetter(foundSquare, remainingLetters, boardState, [...path, foundSquare]);
    if (currentPath) {
      newPath = currentPath;
    }
  });

  return newPath;

}
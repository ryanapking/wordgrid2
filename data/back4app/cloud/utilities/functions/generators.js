const config = require('../config');
const { settings, letterRanges } = config;

const dataConversions = require('./dataConversions');
const { pieceStringToArray } = dataConversions;

function generateGame() {
  return {
    startingBoard: generateBoard(),
    nextPiece: generatePiece(16, true),
    player1Pieces: [
      generatePiece(),
      generatePiece(),
      generatePiece(),
    ],
    player2Pieces: [
      generatePiece(),
      generatePiece(),
      generatePiece(),
    ],
  };
}

function generateChallenge() {
  let pieceBank = [];
  for (let moveCount = 0; moveCount < (settings.challengeMoves - 1); moveCount++) {
    let pieceSet = {};
    for (let pieceSize = settings.challengeMinPieceSize; pieceSize <= settings.challengeMaxPieceSize; pieceSize++) {
      pieceSet[pieceSize] = generatePiece(pieceSize);
    }
    pieceBank.push(pieceSet);
  }

  const challenge = {
    startingBoard: generateBoard(),
    startingPieces: [
      generatePiece(),
      generatePiece(),
      generatePiece(),
    ],
    pieceBank,
  };

  console.log('challenge:', challenge);

  return challenge;
}

// a board is a 100 character string, filled to the defined density with random characters
function generateBoard() {
  let randomSpaces = [];
  let boardSpaceCount = settings.boardWidth * settings.boardHeight;
  // get board spaces until we exceed the starting board density
  while ((randomSpaces.length / boardSpaceCount) < settings.startingLetterDensity) {
    let rando = Math.floor(Math.random() * boardSpaceCount);
    if (!randomSpaces.includes(rando)) {
      randomSpaces.push(rando);
    }
  }
  let board = " ".repeat(settings.boardWidth * settings.boardHeight);
  randomSpaces.forEach( (space) => {
    board = setCharAt(board, space, getRandomLetter());
  });
  return board;
}

function generatePiece(pieceSize = 4, futurePiece = false) {
  // number of possible spaces
  let possibleSpaces = settings.maxPieceWidth * settings.maxPieceHeight;

  // make sure the requested piece size isn't too big, which would cause an infinite loop
  if (pieceSize > possibleSpaces) pieceSize = possibleSpaces;

  // array of possible spaces
  let remainingSpaces = [];
  while (remainingSpaces.length < possibleSpaces) {
    const stringIndex = remainingSpaces.length;
    const space = {
      stringIndex: stringIndex,
      rowIndex: Math.floor(stringIndex / settings.maxPieceWidth),
      columnIndex: stringIndex % settings.maxPieceWidth
    };
    remainingSpaces.push(space);
  }

  // pick a random starting point and add it
  let startingPoint = Math.floor(Math.random() * remainingSpaces.length);
  let randomSpaces = [remainingSpaces[startingPoint]];
  remainingSpaces.splice(startingPoint, 1);

  // get some random spaces that will be filled with letters
  while (randomSpaces.length < pieceSize) {

    // create an array of the valid remaining spaces (must be next to an existing letter)
    const validRemainingSpaces = remainingSpaces
      .map( (remainingSpace, currentIndex) => {
        return {...remainingSpace, currentIndex};
      })
      .filter( (remainingSpace) => {
        let spaceValid = false;

        randomSpaces.forEach( (randomSpace) => {
          const rowDiff = Math.abs(remainingSpace.rowIndex - randomSpace.rowIndex);
          const columnDiff = Math.abs(remainingSpace.columnIndex - randomSpace.columnIndex);
          if ((rowDiff <= 1 && columnDiff === 0) || (columnDiff <= 1 && rowDiff === 0)) {
            spaceValid = true;
          }
        });

        return spaceValid
      });

    // pick one of the valid spaces at random
    let randomRemainingPointIndex = Math.floor(Math.random() * validRemainingSpaces.length);
    let randomRemainingPoint = validRemainingSpaces[randomRemainingPointIndex];
    let pointIndex = randomRemainingPoint.currentIndex;

    // add the space to random spaces array and remove from remaining spaces
    randomSpaces.push(remainingSpaces[pointIndex]);
    remainingSpaces.splice(pointIndex, 1);

  }

  // build a piece with all the previous junk
  let piece = " ".repeat(possibleSpaces);

  randomSpaces.forEach( (space) => {
    piece = setCharAt(piece, space.stringIndex, getRandomLetter());
  });

  if (futurePiece) {
    let pieceOrder = randomSpaces.map( (space) => space.stringIndex).join(",");
    return {
      string: piece,
      order: pieceOrder,
    };
  } else {
    return piece;
  }
}

function generateLocalPiece(pieceSize = 4) {
  const piece = generatePiece(pieceSize);
  return pieceStringToArray(piece);
}

function getRandomLetter() {
  const rando = Math.floor((Math.random() * letterRanges.high));
  let letter = 'e'; // default to e, just in case

  letterRanges.ranges.forEach( (range) => {
    if (rando >= range.low && rando < range.stop) {
      letter = range.letter;
    }
  });

  return letter;
}

function setCharAt(str, index, chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}

module.exports = {
  generateGame,
  generateChallenge,
  generateBoard,
  generatePiece,
  generateLocalPiece,
  getRandomLetter,
  setCharAt,
};
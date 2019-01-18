const config = require('../config');
const { settings, letterRanges } = config;

const dataConversions = require('./dataConversions');
const { pieceStringToArray } = dataConversions;

function generateGame(userID = null) {
  return {
    p1: userID, // user ID of player 2
    p2: null, // user ID of player 1
    t: userID, // user ID of next player to take a turn
    w: null, // string declaring a winner - "p1" or "p2"
    h: [ // move history
      {
        w: null, // word played
        p: null, // user ID of player to make the move
        b: generateBoard(), // board status at the end of the move
        p1: [ // player 1 pieces at the end of the move
          generatePiece(),
          generatePiece(),
          generatePiece(),
        ],
        p2: [ // player 2 pieces at the end of the move
          generatePiece(),
          generatePiece(),
          generatePiece(),
        ]
      }
    ]
  }
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

function generatePiece(pieceSize = 4) {
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

  return piece;
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
  generateBoard,
  generateLocalPiece,
  getRandomLetter,
  setCharAt,
};
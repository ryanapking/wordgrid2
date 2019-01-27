const config = require('../config');
const dataConversions = require('./dataConversions');
const applyMoves = require('./applyMoves');

const settings = config.settings;

function validateMove(uid, sourceData, move) {
  let gameState = dataConversions.remoteToLocal(sourceData, uid);

  const wordPath = dataConversions.wordPathStringToArray(move.wp);
  const wordPathValid = validateWordPath(wordPath, gameState.rows, move.w);

  if (!wordPathValid) return false;

  gameState.rows = applyMoves.getBoardMinusWordPath(gameState.rows, wordPath);

  const placementRef = dataConversions.placementRefStringToArray(move.pr);
  return validatePlacementRef(gameState.meAllPieces, placementRef, gameState.rows);
}


function validateWordPath(wordPath, boardState, moveWord) {
  // function confirms that the word path spells the given word
  if ( moveWord.length !== wordPath.length ) return false;

  let pathWord = "";
  wordPath.forEach( ({ rowIndex, columnIndex }) => {
    pathWord += boardState[rowIndex][columnIndex];
  });

  return (moveWord === pathWord);
}

function validatePlacementRef(playerPieces, placementRef, boardState) {
  // function confirms that the placement ref fits on the board
  const piece = playerPieces[placementRef.pieceIndex];

  // grab each space that we should check
  let boardSpaces = [];
  piece.forEach( (row, pieceRowIndex) => {
    row.forEach( (letter, pieceColumnIndex) => {
      if (letter) {
        const rowIndex = pieceRowIndex + placementRef.rowIndex;
        const columnIndex = pieceColumnIndex + placementRef.columnIndex;
        boardSpaces.push({rowIndex, columnIndex});
      }
    });
  });

  // check the spaces to make sure they're in bounds and don't contain a letter
  let placementValid = true;
  boardSpaces.forEach( ({rowIndex, columnIndex}) => {
    if (!placementValid) return;
    if (rowIndex < 0 || rowIndex >= 10 || columnIndex < 0 || columnIndex >= 10) {
      placementValid = false;
      return;
    }
    if (boardState[rowIndex][columnIndex]) {
      placementValid = false;
    }
  });

  return placementValid;

}

function checkPieceFit(playerPieces, boardState) {
  // checks a player's pieces to see if any of them will fit on the board
  // loops until a piece that fits is found
  let spaceCheck = false;

  const rowStart = -3;
  const columnStart = -3;
  const rowEnd = 13;
  const columnEnd = 13;

  playerPieces.forEach( (piece, pieceIndex) => {
    for (let row = rowStart; row < rowEnd; row++) {
      for (let column = columnStart; column < columnEnd; column++) {

        let collision = false;

        piece.forEach( (pieceRow, pieceRowIndex) => {
          pieceRow.forEach( (letter, pieceColumnIndex) => {
            if (letter) {
              const checkBoardRow = row + pieceRowIndex;
              const checkBoardColumn = column + pieceColumnIndex;
              if (
                checkBoardRow < 0
                || checkBoardRow >= settings.boardHeight
                || checkBoardColumn < 0
                || checkBoardColumn >= settings.boardWidth
                || boardState[checkBoardRow][checkBoardColumn]
              ) {
                collision = true;
              }
            }
          });
        });

        if (!collision) {
          console.log(`piece ${pieceIndex} fits in row: ${row}, col: ${column}`);
          spaceCheck = true;
        }

      }
    }
  });

  return spaceCheck;
}

function gameOverCheck(game) {
  const turns = turnCounter(game);
  const scores = scoreTabulator(game);

  const turnsReached = (turns.p2 >= settings.naturalTurns && turns.p1 === turns.p2);
  const gameTied = (scores.p1 === scores.p2);

  const gameOver = (turnsReached && !gameTied);
  console.log('game over?', gameOver);

  return gameOver;
}

function turnCounter(game) {
  return game.history.reduce( (turnCount, move) => {
    if (move.p === game.p1) {
      return {...turnCount, p1: turnCount.p1 + 1};
    } else if (move.p === game.p2) {
      return {...turnCount, p2: turnCount.p2 + 1};
    } else {
      return turnCount;
    }
  }, {p1: 0, p2: 0});
}

function scoreTabulator(game) {
  return game.history.reduce( (scoreTab, move) => {
    if (move.p === game.p1) {
      return {...scoreTab, p1: scoreTab.p1 + move.wv};
    } else if (move.p === game.p2) {
      return {...scoreTab, p2: scoreTab.p2 + move.wv};
    } else {
      return scoreTab;
    }
  }, {p1: 0, p2: 0});
}

function getWinner(game) {
  const gameOver = gameOverCheck(game);
  if (!gameOver) return null;

  const scores = scoreTabulator(game);
  if (scores.p1 > scores.p2) {
    return "p1";
  } else {
    return "p2";
  }
}

module.exports = {
  checkPieceFit,
  gameOverCheck,
  scoreTabulator,
  getWinner,
  validateMove,
};
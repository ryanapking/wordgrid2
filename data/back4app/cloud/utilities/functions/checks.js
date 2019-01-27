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
  return validatePlacementRef(gameState.currentPlayer.allPieces, placementRef, gameState.rows);
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
  // check that each player has taken their 5 moves
  const currentPlayerNaturalMovesReached = (game.currentPlayer.scoreBoard.length >= 5);
  const opponentNaturalMovesReached = (game.opponent.scoreBoard.length >= 5);
  const naturalMovesReached = (currentPlayerNaturalMovesReached && opponentNaturalMovesReached);

  // in case game is in overtime, check that both players have taken their additional moves
  const equalMoves = (game.currentPlayer.scoreBoard.length === game.opponent.scoreBoard.length);

  // check if one player is leading
  const gameTied = (game.currentPlayer.score === game.opponent.score);

  if (gameTied || !equalMoves || !naturalMovesReached) {
    return false;
  } else {
    return true;
  }
}

// returns false or the id of the winner
function getWinner(game) {
  if (!gameOverCheck(game)) return false;

  if (game.currentPlayer.score > game.opponent.score) {
    return game.currentPlayer.id;
  } else if (game.opponent.score > game.currentPlayer.score) {
    return game.opponent.id;
  } else {
    // in case we make it here without a winner, which shouldn't happen
    return false;
  }
}

module.exports = {
  checkPieceFit,
  gameOverCheck,
  getWinner,
  validateMove,
};
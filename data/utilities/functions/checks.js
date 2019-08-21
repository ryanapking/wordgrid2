const config = require('../config');
const dataConversions = require('./dataConversions');
const applyMoves = require('./applyMoves');
const calculations = require('./calculations');

const settings = config.settings;


function validateChallengeAttempt(remoteChallengeObject, challengeAttempt) {
  // function does not validate words, as that will happen differently on the device and on parse server

  const challenge = dataConversions.challengeRemoteToPlayableObject(remoteChallengeObject);

  if (challengeAttempt.challengeId !== challenge.id) return false;
  if (challengeAttempt.moves.length !== 5) return false;

  let attemptValid = true;
  let attemptScore = 0;

  challengeAttempt.moves.forEach( (move, moveIndex) => {
    if (!attemptValid) return;

    const wordPath = dataConversions.wordPathStringToArray(move.wp);
    const word = move.w;
    const wordPathValid = validateWordPath(wordPath, challenge.rows, word);

    if (wordPathValid) {
      // update game board
      challenge.rows = applyMoves.getBoardMinusWordPath(challenge.rows, wordPath);

      // update score
      attemptScore += calculations.calculateWordValue(word);

      // assign new pieces
      const nextPieceSet = challenge.pieceBank[moveIndex];
      const nextPiece = nextPieceSet[wordPath.length];
      const currentPieces = challenge.pieces.filter( (piece) => {
        return (piece.length > 0);
      });
      challenge.pieces = [...currentPieces, nextPiece];

    } else {
      attemptValid = false;
      return;
    }

    const placementRef = dataConversions.placementRefStringToArray(move.pr);
    const placementRefValid = validatePlacementRef(challenge.pieces, placementRef, challenge.rows);

    if (attemptValid && placementRefValid) {
      // update game board
      challenge.rows = applyMoves.getBoardPlusPiece(challenge.rows, challenge.pieces, placementRef);

      // update score
      const placedPiece = challenge.pieces[placementRef.pieceIndex];
      attemptScore += calculations.calculatePiecePlacementValue(placedPiece);

      // remove placed piece from available pieces
      challenge.pieces = challenge.pieces.filter( (piece, pieceIndex) => {
        return (pieceIndex !== placementRef.pieceIndex);
      });

    } else {
      attemptValid = false;
    }

  });

  attemptValid = (attemptValid && challengeAttempt.score === attemptScore);

  // console.log('challenge:', challenge);
  // console.log('challenge attempt:', challengeAttempt);
  // console.log('attempt valid:', attemptValid);
  // console.log('attempt score:', attemptScore);

  return attemptValid;
}

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
  if ( moveWord.length !== wordPath.length || wordPath.length < 4 ) return false;

  let pathWord = "";
  wordPath.forEach( ({ rowIndex, columnIndex }) => {
    pathWord += boardState[rowIndex][columnIndex];
  });

  return (moveWord === pathWord);
}

function validatePlacement(piece, placementRef, boardState) {
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

function validatePlacementRef(playerPieces, placementRef, boardState) {
  // function confirms that the placement ref fits on the board
  const piece = playerPieces[placementRef.pieceIndex];
  return validatePlacement(piece, placementRef, boardState);
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

function gameOverCheck(gameState) {
  const player1MoveCount = gameState.player1ScoreBoard.length;
  const player2MoveCount = gameState.player2ScoreBoard.length;

  // check that each player has taken their 5 moves
  const naturalMovesReached = (player1MoveCount >= 5 && player2MoveCount >= 5);
  if (!naturalMovesReached) return false;

  // in case game is in overtime, check that both players have taken their additional moves
  const equalMoves = (player1MoveCount === player2MoveCount);
  if (!equalMoves) return false;

  // check if one player is leading
  const gameTied = (gameState.player1Score === gameState.player2Score);
  return !gameTied;
}

// returns false or the id of the winner
function getWinner(gameState) {
  if (!gameOverCheck(gameState)) return false;

  if (gameState.player1Score > gameState.player2Score) {
    return gameState.player1Id;
  } else if (gameState.player2Score > gameState.player1Score) {
    return gameState.player2Id;
  } else {
    // in case we make it here without a winner, which shouldn't happen
    return false;
  }
}

/**
 * Returns true or false based on whether the square is in the provided array
 *
 * @param {Object} needleSquare - The square to be searched for
 * @param {number} needleSquare.rowIndex
 * @param {number} needleSquare.columnIndex
 * @param {Object[]} haystackSquares - The squares we are searching in
 * @param {number} haystackSquares[].rowIndex
 * @param {number} haystackSquares[].columnIndex
 *
 * @returns {boolean} true if square is in the provided array
 */
export function isSquareInArray(needleSquare, haystackSquares) {
  for (let i = 0; i < haystackSquares.length; i++) {
    if (haystackSquares[i].rowIndex !== needleSquare.rowIndex) continue;
    if (haystackSquares[i].columnIndex !== needleSquare.columnIndex) continue;
    return true;
  }
  return false;
}

module.exports = {
  validateChallengeAttempt,
  validatePlacement,
  checkPieceFit,
  gameOverCheck,
  getWinner,
  validateMove,
  isSquareInArray,
};
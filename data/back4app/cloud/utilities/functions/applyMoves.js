// a template of what gameState should look like
// structure of what should be provided to apply move
// and what should be returned
// all data should be in local format
const gameStateTemplate = {
  player1Id: null,
  player1Score: null,
  player1ScoreBoard: null,
  player1AllPieces: null,
  player1CurrentPieces: null,
  player1CurrentPiecesIndexes: null,
  player1ConsumedPiecesIndexes: null,
  player2Id: null,
  player2Score: null,
  player2ScoreBoard: null,
  player2AllPieces: null,
  player2CurrentPieces: null,
  player2CurrentPiecesIndexes: null,
  player2ConsumedPiecesIndexes: null,
  boardState: null,
};

// data should already be processed
// string already converted to arrays
const moveTemplate = {
  word: null, // word played
  wordValue: null, // word value
  wordPath: null, // word path string
  placementRef: null, // piece placement ref string
  playerID: null, // user id of player who made the move
};

function applyMove(gameState, move) {
  let newBoardState = gameState.boardState.map( (row) => row.slice() );

  // get the current player
  let player = null;
  if (move.playerID === gameState.player1Id) {
    player = {
      id: gameState.player1Id,
      score: gameState.player1Score,
      scoreBoard: gameState.player1ScoreBoard,
      currentPieces: gameState.player1CurrentPieces,
      currentPiecesIndexes: gameState.player1CurrentPiecesIndexes,
      consumedPiecesIndexes: gameState.player1ConsumedPiecesIndexes,
      allPieces: gameState.player1AllPieces,
    };
  } else if (move.playerID === gameState.player2Id) {
    player = {
      id: gameState.player2Id,
      score: gameState.player2Score,
      scoreBoard: gameState.player2ScoreBoard,
      currentPieces: gameState.player2CurrentPieces,
      currentPiecesIndexes: gameState.player2CurrentPiecesIndexes,
      consumedPiecesIndexes: gameState.player2ConsumedPiecesIndexes,
      allPieces: gameState.player2AllPieces,
    };
  }

  // remove the played word
  newBoardState = getBoardMinusWordPath(newBoardState, move.wordPath);

  // add the placed piece
  newBoardState = getBoardPlusPiece(newBoardState, player.allPieces, move.placementRef);

  // remove the piece from player hand
  player.consumedPiecesIndexes.push(move.placementRef.pieceIndex);
  player.currentPiecesIndexes = filterConsumedPieces(player.allPieces, player.consumedPiecesIndexes);
  player.currentPieces = getCurrentPiecesFromIndexes(player.allPieces, player.currentPiecesIndexes);

  // add the move score
  player.score += move.wordValue;
  player.scoreBoard.push(move.wordValue);

  // assign the values to the appropriate player
  if (move.playerID === gameState.player1Id) {
    return {
      ...gameState,
      boardState: newBoardState,
      player1Id: player.id,
      player1Score: player.score,
      player1ScoreBoard: player.scoreBoard,
      player1CurrentPieces: player.currentPieces,
      player1CurrentPiecesIndexes: player.currentPiecesIndexes,
      player1ConsumedPiecesIndexes: player.consumedPiecesIndexes,
    };
  } else if (move.playerID === gameState.player2Id) {
    return {
      ...gameState,
      boardState: newBoardState,
      player2Id: player.id,
      player2Score: player.score,
      player2ScoreBoard: player.scoreBoard,
      player2CurrentPieces: player.currentPieces,
      player2CurrentPiecesIndexes: player.currentPiecesIndexes,
      player2ConsumedPiecesIndexes: player.consumedPiecesIndexes,
    };
  }

}

// return the indexes of the first three available pieces ( not consumed )
function filterConsumedPieces(pieces, consumedPiecesIndexes) {
  return pieces
    .map( (piece, pieceIndex) => {
      return pieceIndex;
    })
    .filter( (pieceIndex) => {
      return !consumedPiecesIndexes.includes(pieceIndex);
    })
    .map( (pieceIndex) => {
      return pieceIndex;
    })
    .slice(0, 3);
}

function getCurrentPiecesFromIndexes(pieces, currentPiecesIndexes) {
  let playerPieces = pieces.filter( (piece, pieceIndex) => {
    return currentPiecesIndexes.includes(pieceIndex);
  });
  // sometimes a player only has two pieces
  // push an empty array in such cases
  // empty array used mainly for display purposes
  while (playerPieces.length < 3) {
    playerPieces.push([]);
  }
  return playerPieces;
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

function getBoardPlusPiece(boardArray, pieces, placementRef) {
  const piece = pieces[placementRef.pieceIndex];

  // create a copy of the board array
  let newBoardArray = boardArray.map( (row) => row.slice() );

  // add each letter of the piece from the new board array
  piece.forEach( (row, rowIndex) => {
    row.forEach( (letter, columnIndex) => {
      if (letter) {
        const boardRowIndex = placementRef.rowIndex + rowIndex;
        const boardColumnIndex = placementRef.columnIndex + columnIndex;
        newBoardArray[boardRowIndex][boardColumnIndex] = letter;
      }
    });
  });

  return newBoardArray;
}

function getBoardMinusWordPath(boardArray, wordPath) {
  // create a copy of the board array
  let newBoardArray = boardArray.map( (row) => row.slice() );

  // console.log('new board array:', newBoardArray);
  // console.log('word path:', wordPath);

  wordPath.forEach( ({ rowIndex, columnIndex }) => {
    newBoardArray[rowIndex][columnIndex] = "";
  });

  return newBoardArray;
}

module.exports = {
  applyMove,
  getBoardMinusPiece,
  getBoardPlusPiece,
  getBoardMinusWordPath,
  filterConsumedPieces,
  getCurrentPiecesFromIndexes,
};
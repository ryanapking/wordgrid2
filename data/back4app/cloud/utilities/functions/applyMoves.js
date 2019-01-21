// a template of what gameState should look like
// structure of what should be provided to apply move
// and what should be returned
// all data should be in local format
const gameStateTemplate = {
  player1Id: null,
  player1Score: null,
  player1RemotePieces: null,
  player1CurrentPieces: null,
  player2Id: null,
  player2Score: null,
  player2RemotePieces: null,
  player2CurrentPieces: null,
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
      currentPieces: gameState.player1CurrentPieces,
      remotePieces: gameState.player1RemotePieces,
    };
  } else if (move.playerID === gameState.player2Id) {
    player = {
      id: gameState.player2Id,
      score: gameState.player2Score,
      currentPieces: gameState.player2CurrentPieces,
      remotePieces: gameState.player2RemotePieces,
    };
  }

  // remove the played word
  newBoardState = getBoardMinusWordPath(newBoardState, move.wordPath);

  // add the placed piece
  newBoardState = getBoardPlusPiece(newBoardState, player.currentPieces, move.placementRef);

  // remove the piece from player hand
  player.currentPieces[move.placementRef.pieceIndex] = [];

  // add the move score
  player.score += move.wordValue;

  // assign the values to the appropriate player
  if (move.playerID === gameState.player1Id) {
    return {
      ...gameState,
      boardState: newBoardState,
      player1Id: player.id,
      player1Score: player.score,
      player1CurrentPieces: player.currentPieces,
      player1RemotePieces: player.remotePieces,
    };
  } else if (move.playerID === gameState.player2Id) {
    return {
      ...gameState,
      boardState: newBoardState,
      player2Id: player.id,
      player2Score: player.score,
      player2CurrentPieces: player.currentPieces,
      player2RemotePieces: player.remotePieces,
    };
  }

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
};
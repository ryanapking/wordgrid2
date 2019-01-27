const applyMoves = require('./applyMoves');

function remoteToLocal(source, userID, move = null, phase = null) {
  console.log('game source:', source);
  const { player1, player2, player1Pieces, player2Pieces, nextPiece, startingBoard, moves, turn, winner, status } = source;

  // set the initial game state based on remote data
  const player1AllPieces = player1Pieces.map( (piece) => pieceStringToArray(piece));
  const player1CurrentPiecesIndexes = applyMoves.filterConsumedPieces(player1AllPieces, []);
  const player1CurrentPieces = applyMoves.getCurrentPiecesFromIndexes(player1AllPieces, player1CurrentPiecesIndexes);

  const player2AllPieces = player2Pieces.map( (piece) => pieceStringToArray(piece));
  const player2CurrentPiecesIndexes = applyMoves.filterConsumedPieces(player2AllPieces, []);
  const player2CurrentPieces = applyMoves.getCurrentPiecesFromIndexes(player2AllPieces, player2CurrentPiecesIndexes);

  let gameState = {
    player1Id: player1.objectId,
    player1Score: 0,
    player1ScoreBoard: [],
    player1AllPieces,
    player1CurrentPieces,
    player1CurrentPiecesIndexes,
    player1ConsumedPiecesIndexes: [],
    player2Id: player2 ? player2.objectId : null,
    player2Score: 0,
    player2ScoreBoard: [],
    player2AllPieces,
    player2CurrentPieces,
    player2CurrentPiecesIndexes,
    player2ConsumedPiecesIndexes: [],
    boardState: boardStringToArray(startingBoard),
  };

  // apply all moves to the game state
  if (moves) {
    moves.forEach( (move) => {
      const localMove = moveRemoteToLocal(move);
      gameState = applyMoves.applyMove(gameState, localMove);
    });
  }

  console.log('final game state:', gameState);

  // convert the game state to a local object that works with our redux setup

  let p1 = {
    id: gameState.player1Id,
    score: gameState.player1Score,
    scoreBoard: gameState.player1ScoreBoard,
    currentPieces: gameState.player1CurrentPieces,
    currentPiecesIndexes: gameState.player1CurrentPiecesIndexes,
    allPieces: gameState.player1AllPieces,
    name: "unknown player", // doesn't make sense just yet...
  };
  let p2 = {
    id: gameState.player2Id,
    score: gameState.player2Score,
    scoreBoard: gameState.player2ScoreBoard,
    currentPieces: gameState.player2CurrentPieces,
    currentPiecesIndexes: gameState.player2CurrentPiecesIndexes,
    allPieces: gameState.player2AllPieces,
    name: "unknown player", // doesn't make sense just yet...
  };

  let currentPlayer = null;
  let opponent = null;
  if (gameState.player1Id === userID) {
    currentPlayer = p1;
    opponent = p2;
  } else {
    currentPlayer = p2;
    opponent = p1;
  }

  const conversion = {
    // local game data used for display and later converted to a move
    rows: gameState.boardState,
    word: "",
    wordValue: 0,
    wordPath: null,
    placementRef: null,
    consumedSquares: [],

    // player data, used for local display
    currentPlayer,
    opponent,

    // user IDs used primarily for display purposes
    p1: p1.id,
    p2: p2.id,
    turn: turn ? turn.objectId : null,
    winner: winner ? winner.objectId : null,

    // local data for display purposes
    animationOver: true, //(history.length < 2), // no animation until there have been at least two moves
    piecePlaced: false, // determines what action is available to the user

    // to be set when the game is loaded; used when rating a move
    availableWords: {
      longest: null,
      mostValuable: null,
      availableWordCount: null,
    },

    nextPiece, // used after a word is played to generate the opponent's next piece

    // source data can be used to run this process again
    sourceData: source,
  };

  console.log('after conversion:', conversion);
  return conversion;
}

function challengeRemoteToLocal(remoteChallenge) {
  let localPieceBank = remoteChallenge.pieceBank.map((pieceSet) => {
    let localPieceSet = {};
    Object.keys(pieceSet).forEach( (key) => {
      localPieceSet[key] = pieceStringToArray(pieceSet[key]);
    });
    return localPieceSet;
  });

  // create challenge item
  let challenge = {
    rows: boardStringToArray(remoteChallenge.board),
    pieceBank: localPieceBank,
    pieceSet: localPieceBank[0],
    pieces: remoteChallenge.pieces.map( (piece) => pieceStringToArray(piece)),
    history: [],

    word: null,
    wordValue: null,
    wordPath: null,
    consumedSquares: [],

    score: 0,
    gameOver: false,
    attemptSaved: false,
    id: remoteChallenge.id,
  };

  // add the starting condition as the first history object
  challenge.history = [challengeMoveToHistory(challenge)];

  return challenge;
}

function challengeMoveToHistory(challengeData, placementRef = null, placementValue = null) {
  return {
    b: arrayToString(challengeData.rows), // board state
    w: challengeData.word, // word played
    wv: challengeData.wordValue, // word value
    wp: challengeData.wordPath, // path of word played
    pr: placementRef, // reference info for piece placement
    pv: placementValue, // placed tile value (1 per letter)
  };
}

function localToRemote(localData, userID) {
  return {
    w: localData.word, // word
    wv: localData.wordValue, // word value
    wp: localData.wordPath, // word path
    pr: localData.placementRef, // piece placement ref point - piece index, row index, column index
    p: userID, // will data the id of the use who created this history item
  }
}

function moveRemoteToLocal(move) {
  return {
    word: move.w,
    wordValue: move.wv,
    wordPath: wordPathStringToArray(move.wp),
    placementRef: placementRefStringToArray(move.pr),
    playerID: move.p,
  };
}

function pieceStringToArray(pieceSource) {
  if (!pieceSource) return [];
  return Array(4).fill(1).map( (val, index ) => {
    const start = index * 4;
    const end = start + 4;
    return pieceSource
      .slice(start, end)
      .split("")
      .map( letter => letter === " " ? "" : letter);
  });
}

function boardStringToArray(boardSource) {
  return Array(10).fill(1).map( (val, index) => {
    const start = index * 10;
    const end = start + 10;
    return boardSource
      .slice(start, end)
      .split("")
      .map( letter => letter === " " ? "" : letter);
  });
}

function arrayToString(array) {
  return array.map( (row) => {
    return row.map( letter => letter === "" ? " " : letter).join("");
  }).join("");
}

function calculateScore(history, playerID) {
  return history.reduce( (totalScore, move) => {
    if (move.p && move.p === playerID) {
      return totalScore + move.wv;
    } else {
      return totalScore;
    }
  }, 0);
}

function wordPathArrayToString(consumedSquares) {
  return consumedSquares.map( (square) => {
    return `${square.rowIndex},${square.columnIndex}`;
  }).join("|");
}

function wordPathStringToArray(wordPathString) {
  const wordPaths = wordPathString.split("|");
  return wordPaths.map( (coordinateSet) => {
    const squareCoordinates = coordinateSet.split(",");
    return {
      rowIndex: parseInt(squareCoordinates[0]),
      columnIndex: parseInt(squareCoordinates[1])
    };
  });
}

function placementRefStringToArray(placementRefString) {
  const pr = placementRefString.split("|");
  return {
    pieceIndex: parseInt(pr[0]),
    rowIndex: parseInt(pr[1]),
    columnIndex: parseInt(pr[2])
  };
}

function nextPieceStringToLocalPiece(nextPiece, size) {
  const nextPieceString = nextPieceStringToRemotePiece(nextPiece, size);
  return pieceStringToArray(nextPieceString);
}

function nextPieceStringToRemotePiece(nextPiece, size) {
  const orderArray = nextPiece.order.split(",").map( (num) => parseInt(num));
  let pieceString = " ".repeat(nextPiece.string.length); // should always be 16. why don't I just set it to 16....
  orderArray.slice(0, size).forEach( (letterIndex) => {
    pieceString = setCharAt(pieceString, letterIndex, nextPiece.string.charAt(letterIndex));
  });
  return pieceString;
}

function setCharAt(str, index, chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}

module.exports = {
  remoteToLocal,
  challengeRemoteToLocal,
  challengeMoveToHistory,
  localToRemote,
  pieceStringToArray,
  boardStringToArray,
  arrayToString,
  calculateScore,
  wordPathArrayToString,
  wordPathStringToArray,
  placementRefStringToArray,
  nextPieceStringToLocalPiece,
  nextPieceStringToRemotePiece,
};
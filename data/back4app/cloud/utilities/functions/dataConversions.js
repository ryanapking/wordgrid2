const getters = require('./getters');
const applyMoves = require('./applyMoves');

function remoteToLocal(source, userID, move = null, phase = null) {
  const { history, player1, player2, player1Pieces, player2Pieces, startingBoard, moves, turn, winner, status } = source;

  // set the initial game state based on remote data
  const p1Pieces = player1Pieces.map( (piece) => pieceStringToArray(piece));
  const p2Pieces = player2Pieces.map( (piece) => pieceStringToArray(piece));
  let gameState = {
    player1Id: player1.objectId,
    player1Score: 0,
    player1RemotePieces: p1Pieces,
    player1CurrentPieces: p1Pieces,
    player2Id: player2 ? player2.objectId : null,
    player2Score: 0,
    player2RemotePieces: p2Pieces,
    player2CurrentPieces: p2Pieces,
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
  const me = (gameState.player1Id === userID) ? gameState.player1CurrentPieces : gameState.player2CurrentPieces;
  const them = (gameState.player1Id === userID) ? gameState.player2CurrentPieces : gameState.player1CurrentPieces;
  const opponentID = (gameState.player1Id === userID) ? gameState.player2Id : gameState.player1Id;
  const opponentName = "unknown opponent";

  const conversion = {
    // data that is converted and saved to firebase as a move
    rows: gameState.boardState,
    me: me,
    meIndexes: [0, 1, 2], // bullshit array to use as ref between local pieceindex and remote pieceindexes. just an idea for now.
    them: them,
    word: "",
    wordValue: 0,
    wordPath: null,
    placementRef: null,

    // converted and saved as part of the base game - I don't know what this means anymore
    winner: winner,

    // local data used during conversions
    consumedSquares: [],

    // local data for display purposes
    animationOver: true, //(history.length < 2), // no animation until there have been at least two moves
    piecePlaced: false,
    validatingWord: false,
    myScore: (userID === gameState.player1Id) ? gameState.player1Score : gameState.player2Score,
    theirScore: (userID === gameState.player1Id) ? gameState.player2Score : gameState.player1Score,
    scoreBoard: getters.getScoreBoard(history, gameState.player1Id, gameState.player2Id),
    won: winner, // probably setting this wrong.
    opponentID,
    opponentName,

    // to be set when the game is loaded
    availableWords: {
      longest: null,
      mostValuable: null,
      availableWordCount: null,
    },

    // used when converting back to remote
    // history: history,
    p1: gameState.player1Id,
    p2: gameState.player2Id,
    turn: turn.objectId,

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
  const p1Array = (localData.p1 === userID) ? localData.me : localData.them;
  const p2Array = (localData.p2 === userID) ? localData.me : localData.them;
  wordPathArrayToString(localData.consumedSquares);
  return {
    // b: arrayToString(localData.rows), // board state
    p1: p1Array.map( (piece) => arrayToString(piece) ), // p1 pieces
    p2: p2Array.map( (piece) => arrayToString(piece) ), // p2 pieces,
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
};
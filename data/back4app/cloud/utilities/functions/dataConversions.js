const getters = require('./getters');
const { getScoreBoard } = getters;

function remoteToLocal(source, userID) {
  const { history, player1, player2, turn, winner, status } = source;
  const p1 = player1.objectId;
  const p2 = player2 ? player2.objectId : null;
  const current = history[history.length - 1];
  const me = (p1 === userID) ? current.p1 : current.p2;
  const them = (p1 === userID) ? current.p2 : current.p1;
  const opponentID = (p1 === userID) ? p2 : p1;
  const opponentName = "unknown opponent";
  const won = winner;
  const conversion = {
    // data that is converted and saved to firebase as a move
    rows: boardStringToArray(current.b),
    me: me.map( (piece) => pieceStringToArray(piece)),
    them: them.map( (piece) => pieceStringToArray(piece)),
    word: "",
    wordValue: 0,
    wordPath: null,
    placementRef: null,

    // converted and saved as part of the base game
    winner: source.w,

    // local data used during conversions
    consumedSquares: [],

    // local data for display purposes
    animationOver: (history.length < 2), // no animation until there have been at least two moves
    piecePlaced: false,
    validatingWord: false,
    myScore: calculateScore(history, userID),
    theirScore: calculateScore(history, opponentID),
    scoreBoard: getScoreBoard(history, p1, p2),
    won,
    opponentID,
    opponentName,

    // to be set when the game is loaded
    availableWords: {
      longest: null,
      mostValuable: null,
      availableWordCount: null,
    },

    // used when converting back to remote
    history: history,
    p1: p1,
    p2: p2,
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
    b: arrayToString(localData.rows), // board state
    p1: p1Array.map( (piece) => arrayToString(piece) ), // p1 pieces
    p2: p2Array.map( (piece) => arrayToString(piece) ), // p2 pieces,
    w: localData.word, // word
    wv: localData.wordValue, // word value
    wp: localData.wordPath, // word path
    pr: localData.placementRef, // piece placement ref point - piece index, row index, column index
    p: userID, // will data the id of the use who created this history item
  }
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
};
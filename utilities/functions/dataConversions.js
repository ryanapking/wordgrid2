import { getScoreBoard } from './getters';

export function remoteToLocal(source, userID) {
  const current = source.h[source.h.length - 1];
  const me = (source.p1 === userID) ? current.p1 : current.p2;
  const them = (source.p1 === userID) ? current.p2 : current.p1;
  const opponentID = (source.p1 === userID) ? source.p2 : source.p1;
  const opponentName = "unknown opponent";
  const won = (source.w) ? (source[source.w] === userID) : null;
  return {
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
    animationOver: (source.h.length < 2), // no animation until there have been at least two moves
    piecePlaced: false,
    validatingWord: false,
    myScore: calculateScore(source.h, userID),
    theirScore: calculateScore(source.h, opponentID),
    scoreBoard: getScoreBoard(source),
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
    history: source.h,
    p1: source.p1,
    p2: source.p2,
    turn: source.t,

    // source data can be used to run this process again
    sourceData: source,
  };
}

export function challengeRemoteToLocal(remoteChallenge) {
  let localPieceBank = {};
  Object.keys(remoteChallenge.pieceBank).forEach((key) => {
    localPieceBank[key] = remoteChallenge.pieceBank[key].map((pieceString) => pieceStringToArray(pieceString));
  });

  return {
    rows: boardStringToArray(remoteChallenge.board),
    pieceBank: localPieceBank,
    pieces: remoteChallenge.pieces.map( (piece) => pieceStringToArray(piece)),
    history: [],

    word: "",
    wordValue: 0,
    wordPath: null,
    consumedSquares: [],
  };
}

export function localToRemote(localData, userID) {
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
    p: userID, // will store the id of the use who created this history item
  }
}

export function pieceStringToArray(pieceSource) {
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

export function boardStringToArray(boardSource) {
  return Array(10).fill(1).map( (val, index) => {
    const start = index * 10;
    const end = start + 10;
    return boardSource
      .slice(start, end)
      .split("")
      .map( letter => letter === " " ? "" : letter);
  });
}

export function arrayToString(array) {
  return array.map( (row) => {
    return row.map( letter => letter === "" ? " " : letter).join("");
  }).join("");
}

export function calculateScore(history, playerID) {
  return history.reduce( (totalScore, move) => {
    if (move.p && move.p === playerID) {
      return totalScore + move.wv;
    } else {
      return totalScore;
    }
  }, 0);
}

export function wordPathArrayToString(consumedSquares) {
  return consumedSquares.map( (square) => {
    return `${square.rowIndex},${square.columnIndex}`;
  }).join("|");
}

export function wordPathStringToArray(wordPathString) {
  const wordPaths = wordPathString.split("|");
  return wordPaths.map( (coordinateSet) => {
    const squareCoordinates = coordinateSet.split(",");
    return {
      rowIndex: parseInt(squareCoordinates[0]),
      columnIndex: parseInt(squareCoordinates[1])
    };
  });
}
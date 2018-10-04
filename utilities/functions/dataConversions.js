export function remoteToLocal(source, userID) {
  const current = source.history[source.history.length - 1];
  const me = (source.p1 === userID) ? current.p1 : current.p2;
  const them = (source.p1 === userID) ? current.p2 : current.p1;
  const opponentID = (source.p1 === userID) ? source.p2 : source.p1;
  const opponentName = "unknown opponent";
  return {
    consumedSquares: [],
    rows: boardStringToArray(current.b),
    me: me.map( (piece) => pieceStringToArray(piece)),
    them: them.map( (piece) => pieceStringToArray(piece)),
    word: "",
    wordValue: 0,
    piecePlaced: false,
    validatingWord: false,
    myScore: calculateScore(source.history, me),
    theirScore: calculateScore(source.history, them),

    // strictly used for displaying opponent name in /games screen
    opponentID,
    opponentName,

    // used when converting back to remote
    history: source.history,
    p1: source.p1,
    p2: source.p2,
    turn: source.t
  }
}

export function localToRemote(localData, userID) {
  return {
    w: localData.word,
    wv: localData.wordValue,
    p: userID, // will store the id of the use who created this history item
    b: arrayToString(localData.rows),
    p1: localData.me.map( (piece) => arrayToString(piece) ),
    p2: localData.them.map( (piece) => arrayToString(piece) ),
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
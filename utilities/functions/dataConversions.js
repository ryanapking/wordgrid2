export function remoteToLocal(source) {
  const current = source.history[source.history.length - 1];
  return {
    consumedSquares: [],
    rows: boardStringToArray(current.b),
    me: current.p1.map( (piece) => pieceStringToArray(piece)),
    them: current.p2.map( (piece) => pieceStringToArray(piece)),
    word: "",
    piecePlaced: false,
    validatingWord: false,

    // used when converting back to remote
    history: source.history,
    p1: source.p1,
    p2: source.p2
  }
}

export function localToRemote(localData) {
  return {
    w: localData.word,
    p: null, // will be the id of the use who created this history item
    b: arrayToString(localData.rows),
    p1: localData.me.map( (piece) => arrayToString(piece) ),
    p2: localData.them.map( (piece) => arrayToString(piece) )
  }
}

export function pieceStringToArray(pieceSource) {
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
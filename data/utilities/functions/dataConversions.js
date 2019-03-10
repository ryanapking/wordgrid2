const applyMoves = require('./applyMoves');

function remoteToStartingGameState(source) {
  const { player1, player2, player1Pieces, player2Pieces, startingBoard } = source;

  // set the initial game state based on remote data
  const player1AllPieces = player1Pieces.map( (piece) => pieceStringToArray(piece));
  const player1CurrentPiecesIndexes = applyMoves.filterConsumedPieces(player1AllPieces, []);
  const player1CurrentPieces = applyMoves.getCurrentPiecesFromIndexes(player1AllPieces, player1CurrentPiecesIndexes);

  const player2AllPieces = player2Pieces.map( (piece) => pieceStringToArray(piece));
  const player2CurrentPiecesIndexes = applyMoves.filterConsumedPieces(player2AllPieces, []);
  const player2CurrentPieces = applyMoves.getCurrentPiecesFromIndexes(player2AllPieces, player2CurrentPiecesIndexes);

  return {
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
}

function remoteToLocal(source, userID, movesToApply = null, phase = null) {
  // console.log('game source:', source);
  const { nextPiece, moves, turn, winner } = source;

  let gameState = remoteToStartingGameState(source);

  // apply all moves to the game state
  if (moves) {
    moves.forEach( (move) => {
      const localMove = moveRemoteToLocal(move);
      gameState = applyMoves.applyMove(gameState, localMove);
    });
  }

  // console.log('final game state:', gameState);

  // convert the game state to a local object that works with our redux setup

  let p1 = {
    label: "p1",
    id: gameState.player1Id,
    score: gameState.player1Score,
    scoreBoard: gameState.player1ScoreBoard,
    currentPieces: gameState.player1CurrentPieces,
    currentPiecesIndexes: gameState.player1CurrentPiecesIndexes,
    allPieces: gameState.player1AllPieces,
    name: "unknown player", // doesn't make sense just yet...
  };
  let p2 = {
    label: "p2",
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
    animationOver: !moves, // no animation unless there has been a move
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
    moves,
    gameState,
  };

  // console.log('after conversion:', conversion);
  return conversion;
}

function challengeRemoteToLocalStorageObject(remoteChallenge, date = null) {
  return {
    id: remoteChallenge.id,
    startingBoard: remoteChallenge.get('startingBoard'),
    startingPieces: remoteChallenge.get('startingPieces'),
    pieceBank: remoteChallenge.get('pieceBank'),
    startTime: remoteChallenge.get('startDate').getTime(),
    endTime: remoteChallenge.get('endDate').getTime(),
    // date is probably not needed. if it is, just send it in to avoid an unwanted dependency in our bit repo
    date: date,
  };
}

function challengeLocalStorageObjectToPlayableObject(localChallengeObject) {
  let localPieceBank = localChallengeObject.pieceBank.map((pieceSet) => {
    let localPieceSet = {};
    Object.keys(pieceSet).forEach( (key) => {
      localPieceSet[key] = pieceStringToArray(pieceSet[key]);
    });
    return localPieceSet;
  });

  // create challenge item
  let challenge = {
    rows: boardStringToArray(localChallengeObject.startingBoard),
    pieceBank: localPieceBank,
    pieceSet: localPieceBank[0],
    pieces: [...localChallengeObject.startingPieces, ""].map( (piece) => pieceStringToArray(piece)),
    moves: [],

    word: null,
    wordValue: null,
    wordPath: null,
    consumedSquares: [],

    score: 0,
    gameOver: false,
    attemptSaved: false,
    id: localChallengeObject.id,
    date: localChallengeObject.date,
  };

  return challenge;
}

function challengeStateToMove(challengeData, placementRef = null, placementValue = null) {
  return {
    w: challengeData.word, // word played
    wv: challengeData.wordValue, // word value
    wp: challengeData.wordPath, // path of word played
    pr: placementRef, // reference info for piece placement
    pv: placementValue, // place tile value (1 per letter)
  }
}

function challengeStateToAttempt(challengeData) {
  return {
    score: challengeData.score,
    challengeId: challengeData.id,
    challengeDate: challengeData.date,
    moves: challengeData.moves,
    savedRemotely: false,
  }
}

function challengeAttemptToReviewObject(challengeLocalObject, challengeAttempt) {
  let challenge = challengeLocalStorageObjectToPlayableObject(challengeLocalObject);

  let states = [];

  challengeAttempt.moves.forEach( (move, moveIndex) => {

    const initialState = {
      boardState: challenge.rows.map( (row) => row.slice() ),
      pieces: challenge.pieces.map( (row) => row.slice()),
    };

    const wordPath = wordPathStringToArray(move.wp);

    challenge = applyMoves.challengePlayWord(challenge, wordPath, moveIndex);

    const secondState = {
      boardState: challenge.rows.map( (row) => row.slice() ),
      pieces: challenge.pieces.map( (row) => row.slice()),
    };

    const placementRef = placementRefStringToArray(move.pr);
    const piece = secondState.pieces[placementRef.pieceIndex];
    const pieceBoardSquares = placementRefToBoardSquares(placementRef, piece);

    challenge = applyMoves.challengePlacePiece(challenge, placementRef);

    const thirdState = {
      boardState: challenge.rows.map( (row) => row.slice() ),
      pieces: challenge.pieces.map( (row) => row.slice()),
    };

    states.push({
      placementRef,
      piece,
      pieceBoardSquares,
      wordPath,
      initialState,
      secondState,
      thirdState,
      wordValue: move.wv,
      placementValue: move.pv,
      totalValue: move.wv + move.pv,
      word: move.w,
    });

  });

  // console.log('review object:', states);

  return states;
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

function placementRefToBoardSquares(placementRef, piece) {
  let squares = [];
  piece.forEach( (row, rowIndex) => {
    row.forEach( (letter, columnIndex) => {
      if (letter) {
        squares.push({
          rowIndex: placementRef.rowIndex + rowIndex,
          columnIndex: placementRef.columnIndex + columnIndex,
        });
      }
    });
  });
  return squares;
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
  remoteToStartingGameState,
  remoteToLocal,
  challengeRemoteToLocalStorageObject,
  challengeLocalStorageObjectToPlayableObject,
  challengeStateToMove,
  challengeStateToAttempt,
  challengeAttemptToReviewObject,
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
  moveRemoteToLocal,
};
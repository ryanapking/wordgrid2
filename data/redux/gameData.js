import {
  remoteToLocal,
  calculateWordValue,
  wordPathArrayToString,
  generateLocalPiece
} from '../utilities';
import english from '../english';

// available actions
// game actions
export const PLACE_PIECE = 'wordgrid2/gameData/PLACE_PIECE';
export const CONSUME_SQUARE = 'wordgrid2/gameData/CONSUME_SQUARE';
export const REMOVE_SQUARE = 'wordgrid2/gameData/REMOVE_SQUARE';
export const CLEAR_CONSUMED_SQUARES = 'wordgrid2/gameData/CLEAR_CONSUMED_SQUARES';
export const SET_OPPONENT_NAME = 'wordgrid2/gameData/SET_OPPONENT_NAME';
export const ADD_OPPONENT_PIECE = 'wordgrid2/gameData/ADD_OPPONENT_PIECE';
export const SET_BOARD_ROWS = 'wordgrid2/gameData/SET_BOARD_ROWS';
export const PLAY_WORD = 'wordgrid2/gameData/PLAY_WORD';
export const MARK_ANIMATION_PLAYED = 'wordgrid2/gameData/MARK_ANIMATION_PLAYED';
export const SET_AVAILABLE_WORDS_DATA = 'wordgrid2/gameData/SET_AVAILABLE_WORDS_DATA';

// syncing actions
export const SET_LOCAL_GAME_IDS = 'wordgrid2/gameData/SET_LOCAL_GAME_IDS';
export const SET_LOCAL_GAME_BY_ID = 'wordgrid2/gameData/SET_LOCAL_GAME_BY_ID';
export const REMOVE_LOCAL_GAME_BY_ID = 'wordgrid2/gameData/REMOVE_LOCAL_GAME_BY_ID';

// initial state
const initialState = {
  byID: {},
  allIDs: [],
};

// reducer manager
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PLACE_PIECE:
      return placePieceReducer(state, action);
    case CONSUME_SQUARE:
      return consumeSquareReducer(state, action);
    case REMOVE_SQUARE:
      return removeSquareReducer(state, action);
    case CLEAR_CONSUMED_SQUARES:
      return clearConsumedSquareReducer(state, action);
    case SET_LOCAL_GAME_IDS:
      return setLocalGameIDsReducer(state, action);
    case SET_LOCAL_GAME_BY_ID:
      return setLocalGameDataReducer(state, action);
    case SET_OPPONENT_NAME:
      return setOpponentNameReducer(state, action);
    case REMOVE_LOCAL_GAME_BY_ID:
      return removeLocalGameByIDReducer(state, action);
    case ADD_OPPONENT_PIECE:
      return addOpponentPieceReducer(state, action);
    case SET_BOARD_ROWS:
      return setBoardRowsReducer(state, action);
    case PLAY_WORD:
      return playWordReducer(state, action);
    case MARK_ANIMATION_PLAYED:
      return markAnimationPlayedReducer(state, action);
    case SET_AVAILABLE_WORDS_DATA:
      return setAvailableWordsDataReducer(state, action);
    default:
      return state;
  }
}

// individual reducer functions
function placePieceReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];
  const rows = action.rows;

  const remainingPieces = game.currentPlayer.currentPieces.filter( (piece, pieceIndex) => pieceIndex !== parseInt(action.pieceIndex));
  const newCurrentPieces = [...remainingPieces, []];

  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        rows,
        piecePlaced: true,
        placementRef: action.placementRef,
        currentPlayer: {
          ...game.currentPlayer,
          currentPieces: newCurrentPieces,
        }
      },
    }
  };
}

function consumeSquareReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];
  const consumedSquares = game.consumedSquares.concat(action.square);
  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        consumedSquares
      }
    }
  };
}

function removeSquareReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];
  const consumedSquares = game.consumedSquares.slice(0, game.consumedSquares.length - 1);
  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        consumedSquares
      }
    }
  };
}

function clearConsumedSquareReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];
  const consumedSquares = [];
  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        consumedSquares
      }
    }
  };
}

function setLocalGameIDsReducer(state, action) {
  const allIDs = action.gameIDs;
  return {
    ...state,
    allIDs
  }
}

function setLocalGameDataReducer(state, action) {
  const byID = state.byID;
  let newState = {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: action.localData
    },
  };

  // console.log("new state:", newState);

  return newState;
}

function setOpponentNameReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];
  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        opponentName: action.opponentName
      }
    }
  };
}

function removeLocalGameByIDReducer(state, action) {
  let byID = {...state.byID};
  delete byID[action.gameID];
  return {
    ...state,
    byID
  }
}

function addOpponentPieceReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];
  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        them: action.pieces
      }
    }
  };
}

function setBoardRowsReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];
  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        rows: action.rows,
      }
    }
  };
}

function playWordReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];

  const newGameState = {
    ...game,
    word: action.word,
    wordPath: action.wordPath,
    wordValue: action.wordValue,
    consumedSquares: [],
    rows: action.newRows,
    // them: action.newPieces,
    // scoreBoard: action.scoreBoard,
    currentPlayer: {
      ...game.currentPlayer,
      scoreBoard: action.newScoreBoard,
    }
  };

  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...newGameState,
      }
    }
  };
}

function markAnimationPlayedReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];

  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        animationOver: true
      }
    }
  }
}

function setAvailableWordsDataReducer(state, action) {
  const byID = state.byID;
  const game = state.byID[action.gameID];

  return {
    ...state,
    byID: {
      ...byID,
      [action.gameID]: {
        ...game,
        availableWords: {
          longest: action.longest,
          mostValuable: action.mostValuable,
          availableWordCount: action.availableWordCount,
        }
      }
    }
  }
}

// action creators
export function placePiece(gameID, pieceIndex, rowRef, columnRef) {
  return (dispatch, getState) => {
    const { gameData } = getState();
    const game = gameData.byID[gameID];
    const piece = game.currentPlayer.currentPieces[pieceIndex];
    const remotePieceIndex = game.currentPlayer.currentPiecesIndexes[pieceIndex];
    const placementRef = [remotePieceIndex, rowRef, columnRef].join("|");

    // make a full copy of the existing rows to manipulate
    let newRows = game.rows.map( (row) => [...row] );

    // add the piece letters to the rows copy
    piece.forEach((row, rowIndex) => {
      row.forEach((letter, columnIndex) => {
        const boardRow = rowRef + rowIndex;
        const boardColumn = columnRef + columnIndex;
        if (letter) {
          newRows[boardRow][boardColumn] = letter;
        }
      });
    });

    dispatch({
      type: PLACE_PIECE,
      rows: newRows,
      pieceIndex,
      gameID,
      placementRef,
    });
  };
}

export function consumeSquare(square, gameID) {
  return {
    type: CONSUME_SQUARE,
    square,
    gameID
  }
}

export function removeSquare(gameID) {
  return {
    type: REMOVE_SQUARE,
    gameID
  }
}

export function clearConsumedSquares(gameID) {
  return {
    type: CLEAR_CONSUMED_SQUARES,
    gameID
  }
}

export function setLocalGameIDs(gameIDs) {
  return {
    type: SET_LOCAL_GAME_IDS,
    gameIDs
  }
}

export function setLocalGameDataByID(gameID, userID, sourceData) {
  const localData = remoteToLocal(sourceData, userID);
  return {
    type: SET_LOCAL_GAME_BY_ID,
    localData,
    gameID
  }
}

export function setOpponentName(gameID) {
  return (dispatch, getState) => {
    const { gameData } = getState();
    const opponentID = gameData.byID[gameID].opponent.id;
    if (!opponentID) return;

    // getUserName(opponentID)
    //   .then( (opponentName) => {
    //     dispatch({
    //       type: SET_OPPONENT_NAME,
    //       gameID,
    //       opponentName,
    //     });
    //   })
  };
}

export function removeLocalGameByID(gameID) {
  return {
    type: REMOVE_LOCAL_GAME_BY_ID,
    gameID
  }
}

export function addOpponentPiece(gameID, pieces) {
  return {
    type: ADD_OPPONENT_PIECE,
    gameID,
    pieces
  };
}

export function setBoardRows(gameID, rows) {
  return {
    type: SET_BOARD_ROWS,
    gameID,
    rows
  }
}

export function playWord(gameID, userID) {
  // console.log('playWord()');
  return (dispatch, getState) => {
    const { gameData } = getState();
    // console.log('game data:', gameData);
    const game = gameData.byID[gameID];
    const word = game.consumedSquares.reduce( (word, square) => word + square.letter, "");

    if (word.length >= 4 && english.contains(word)) {
      const wordValue = calculateWordValue(word);
      const wordPath = wordPathArrayToString(game.consumedSquares);

      const newRows = game.rows.map( (row, rowIndex ) => {
        return row.map( (letter, columnIndex) => {
          const letterPlayed = game.consumedSquares.reduce( (found, square) => found || (square.rowIndex === rowIndex && square.columnIndex === columnIndex), false );
          return letterPlayed ? "" : letter;
        });
      });

      // this needs to be reworked to function with the piece being generated remotely

      // const opponentPieces = game.them.filter( (piece) => piece.length);
      // let newPieces = game.them;
      //
      // // add a new piece if needed
      // if (opponentPieces.length < 3) {
      //   newPieces = [...opponentPieces, generateLocalPiece(word.length)];
      // }


      let newScoreBoard = [
        ...game.currentPlayer.scoreBoard,
        wordValue,
      ];

      dispatch({
        type: PLAY_WORD,
        gameID,
        userID,
        word,
        wordPath,
        wordValue,
        newRows,
        // newPieces,
        newScoreBoard,
      });
    }
  };
}

export function markAnimationPlayed(gameID) {
  return {
    type: MARK_ANIMATION_PLAYED,
    gameID
  }
}

export function setAvailableWordsData(gameID, longest, mostValuable, availableWordCount) {
  return {
    type: SET_AVAILABLE_WORDS_DATA,
    gameID,
    longest,
    mostValuable,
    availableWordCount,
  }
}
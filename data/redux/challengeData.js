import {
  challengeRemoteToPlayableObject,
  challengeStateToMove,
  placementRefStringToArray,
  wordPathArrayToString,
} from '../utilities/functions/dataConversions';
import { calculatePiecePlacementValue, calculateWordValue } from '../utilities/functions/calculations';
import { getBoardPlusPiece } from '../utilities/functions/applyMoves';
import english from '../english';

// available actions
const CHALLENGE_SET_LOCAL_DATA = 'wordgrid2/challengeData/CHALLENGE_SET_LOCAL_DATA';
const CHALLENGE_CONSUME_SQUARE = 'wordgrid2/challengeData/CHALLENGE_CONSUME_SQUARE';
const CHALLENGE_REMOVE_SQUARE = 'wordgrid2/challengeData/CHALLENGE_REMOVE_SQUARE';
const CHALLENGE_CLEAR_CONSUMED_SQUARES = 'wordgrid2/challengeData/CHALLENGE_CLEAR_CONSUMED_SQUARES';
const CHALLENGE_PLAY_WORD = 'wordgrid2/challengeData/CHALLENGE_PLAY_WORD';
const CHALLENGE_PLACE_PIECE = 'wordgrid2/challengeData/CHALLENGE_PLACE_PIECE';
const CHALLENGE_MARK_SAVED = 'wordgrid2/challengeData/CHALLENGE_MARK_SAVED';

const initialState = {
  challenge: null,
};

// reducer manager
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CHALLENGE_SET_LOCAL_DATA:
      return { ...state, challenge: action.challenge };
    case CHALLENGE_CONSUME_SQUARE:
      return consumeSquareReducer(state, action);
    case CHALLENGE_REMOVE_SQUARE:
      return removeSquareReducer(state, action);
    case CHALLENGE_CLEAR_CONSUMED_SQUARES:
      return clearConsumedSquareReducer(state, action);
    case CHALLENGE_PLAY_WORD:
      return playWordReducer(state, action);
    case CHALLENGE_PLACE_PIECE:
      return placePieceReducer(state, action);
    case CHALLENGE_MARK_SAVED:
      return markSavedReducer(state, action);
    default:
      return state;
  }
}

// reducers
function consumeSquareReducer(state, action) {
  return {
    ...state,
    challenge: {
      ...state.challenge,
      consumedSquares: state.challenge.consumedSquares.concat(action.square),
    },
  };
}

function removeSquareReducer(state, action) {
  return {
    ...state,
    challenge: {
      ...state.challenge,
      consumedSquares: state.challenge.consumedSquares.slice(0, state.challenge.consumedSquares.length - 1),
    },
  };
}

function clearConsumedSquareReducer(state, action) {
  return {
    ...state,
    challenge: {
      ...state.challenge,
      consumedSquares: [],
    },
  };
}

function playWordReducer(state, action) {
  const { challenge } = state;
  const word = challenge.consumedSquares.reduce( (word, square) => word + square.letter, "");

  if (word.length < 4 || !english.contains(word)) {
    return { ...state };
  }

  const wordValue = calculateWordValue(word);
  const wordPath = wordPathArrayToString(challenge.consumedSquares);

  const newRows = challenge.rows.map( (row, rowIndex ) => {
    return row.map( (letter, columnIndex) => {
      const letterPlayed = challenge.consumedSquares.reduce( (found, square) => found || (square.rowIndex === rowIndex && square.columnIndex === columnIndex), false );
      return letterPlayed ? "" : letter;
    });
  });

  const score = challenge.score + wordValue;

  let pieces = challenge.pieces.filter( (piece) => piece.length > 0);
  pieces = [...pieces, challenge.pieceSet[word.length]];

  return {
    ...state,
    challenge: {
      ...state.challenge,
      word,
      wordValue,
      wordPath,
      consumedSquares: [],
      rows: newRows,
      score,
      pieces,
    }
  }
}

function placePieceReducer(state, action) {
  const { pieceIndex, rowRef, columnRef } = action;
  const { challenge } = state;
  const piece = challenge.pieces[pieceIndex];

  const placementRefString = [pieceIndex, rowRef, columnRef].join("|");
  const placementRefArray = placementRefStringToArray(placementRefString);

  const newRows = getBoardPlusPiece(challenge.rows, challenge.pieces, placementRefArray);
  const placementValue = calculatePiecePlacementValue(piece);
  const score = challenge.score + placementValue;

  // remove the played piece and add the next piece
  const remainingPieces = challenge.pieces.filter( (piece, currentPieceIndex) => currentPieceIndex !== parseInt(pieceIndex));
  const pieces = [...remainingPieces, []];

  // convert the data into a move to be saved
  const newMoveItem = challengeStateToMove(challenge, placementRefString, placementValue);
  const moves = [...challenge.moves, newMoveItem];

  const pieceSet = challenge.pieceBank[moves.length];
  const gameOver = (moves.length >= 5);

  return {
    ...state,
    challenge: {
      ...state.challenge,
      word: "",
      wordPath: null,
      wordValue: null,
      pieces,
      pieceSet,
      moves,
      rows: newRows,
      gameOver,
      score,
    }
  }
}

function markSavedReducer(state, action) {
  return {
    ...state,
    challenge: {
      ...state.challenge,
      attemptSaved: true,
    }
  };
}

// action creators
export function setLocalChallengeData(sourceChallengeData) {
  return {
    type: CHALLENGE_SET_LOCAL_DATA,
    challenge: challengeRemoteToPlayableObject(sourceChallengeData),
  };
}

export function consumeSquare(square) {
  return {
    type: CHALLENGE_CONSUME_SQUARE,
    square,
  };
}

export function removeSquare() {
  return {
    type: CHALLENGE_REMOVE_SQUARE,
  };
}

export function clearConsumedSquares() {
  return {
    type: CHALLENGE_CLEAR_CONSUMED_SQUARES,
  };
}

export function playWord() {
  return {
    type: CHALLENGE_PLAY_WORD,
  };
}

export function placePiece(pieceIndex, rowRef, columnRef) {
  return {
    type: CHALLENGE_PLACE_PIECE,
    pieceIndex,
    rowRef,
    columnRef,
  };
}

export function markSaved() {
  return {
    type: CHALLENGE_MARK_SAVED
  }
}

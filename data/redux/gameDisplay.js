// available actions
export const DISPLAY_GAMEBOARD_SET = 'wordgrid2/gameDisplay/DISPLAY_GAMEBOARD_SET';
export const DISPLAY_SET_PIECE_LOCATION = 'wordgrid2/gameDisplay/DISPLAY_SET_PIECE_LOCATION';
export const DISPLAY_CLEAR_PIECE_LOCATIONS = 'wordgrid2/gameDisplay/DISPLAY_CLEAR_PIECE_LOCATIONS';
export const DISPLAY_SET_HOVERED_SPACES = 'wordgrid2/gameDisplay/DISPLAY_SET_HOVERED_SPACES';
export const DISPLAY_CLEAR_HOVERED_SPACES = 'wordgrid2/gameDisplay/DISPLAY_CLEAR_HOVERED_SPACES';

// initial state
const initialState = {
  boardLocation: {
    // game board variables
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    // column variables
    rowHeight: 0,
    columnWidth: 0,
    rowMidPoints: [],
    columnMidPoints: [],
  },
  hoveredSpaces: [],
  pieceLocations: {}
};

// reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case DISPLAY_GAMEBOARD_SET:
      return {...state, boardLocation: action.boardLocation};
    case DISPLAY_SET_PIECE_LOCATION:
      return {...state, pieceLocations: {...state.pieceLocations, [action.pieceIndex]: action.pieceLocation}};
    case DISPLAY_CLEAR_PIECE_LOCATIONS:
      return {...state, pieceLocations: {}};
    case DISPLAY_SET_HOVERED_SPACES:
      return {...state, hoveredSpaces: action.hoveredSpaces};
    case DISPLAY_CLEAR_HOVERED_SPACES:
      return {...state, hoveredSpaces: []};
    default:
      return state;
  }
}

// action creators
export function setBoardLocation(x, y, width, height) {
  const rowHeight = height / 10;
  const columnWidth = width / 10;

  const rowMidPoints = Array(10).fill(1).map( (val, index) => {
    return (y + (rowHeight * index) + (rowHeight / 2));
  });

  const columnMidPoints = Array(10).fill(1).map( (val, index) => {
    return (x + (columnWidth * index) + (columnWidth / 2));
  });

  return {
    type: DISPLAY_GAMEBOARD_SET,
    boardLocation: { x, y, width, height, rowMidPoints, columnMidPoints, rowHeight, columnWidth }
  };
}

export function setPieceLocation(pieceIndex, pieceLocation) {
  return {
    type: DISPLAY_SET_PIECE_LOCATION,
    pieceLocation,
    pieceIndex,
  }
}

export function clearPieceLocations() {
  return {
    type: DISPLAY_CLEAR_PIECE_LOCATIONS,
  }
}

export function setHoveredSpaces(hoveredSpaces) {
  return {
    type: DISPLAY_SET_HOVERED_SPACES,
    hoveredSpaces,
  };
}

export function clearHoveredSpaces() {
  return {
    type: DISPLAY_CLEAR_HOVERED_SPACES,
  };
}
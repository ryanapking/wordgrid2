// available actions
export const SET_ERROR_MESSAGE = 'wordgrid2/messages/SET_ERROR_MESSAGE';
export const CLEAR_ERROR_MESSAGE = 'wordgrid2/messages/CLEAR_ERROR_MESSAGE';
export const SET_INFO_MESSAGE = 'wordgrid2/messages/SET_INFO_MESSAGE';
export const CLEAR_INFO_MESSAGE =  'wordgrid2/messages/CLEAR_INFO_MESSAGE';

// initial state
const initialState = {
  error: [],
  info: [],
};

// reducer manager
export default function reducer(state = initialState, action) {
  switch(action.type) {
    case SET_ERROR_MESSAGE:
      return setErrorMessageReducer(state, action);
    case CLEAR_ERROR_MESSAGE:
      return clearErrorMessageReducer(state, action);
    case SET_INFO_MESSAGE:
      return setInfoMessageReducer(state, action);
    case CLEAR_INFO_MESSAGE:
      return clearInfoMessageReducer(state, action);
    default:
      return state;
  }
}

// reducers
function setErrorMessageReducer(state, action) {
  return {
    ...state,
    error: [
      ...state.error,
      action.message,
    ],
  };
}

function clearErrorMessageReducer(state, action) {
  return {
    ...state,
    error: [
      ...state.error.slice(0, action.messageIndex),
      ...state.error.slice(action.messageIndex + 1)
    ],
  };
}

function setInfoMessageReducer(state, action) {
  return {
    ...state,
    info: [
      ...state.info,
      action.message,
    ],
  };
}

function clearInfoMessageReducer(state, action) {
  return {
    ...state,
    info: [
      ...state.info.slice(0, action.messageIndex),
      ...state.info.slice(action.messageIndex + 1)
    ],
  };
}

// action creators
export function setErrorMessage(message) {
  return {
    type: SET_ERROR_MESSAGE,
    message,
  };
}

export function clearErrorMessage(messageIndex) {
  return {
    type: CLEAR_ERROR_MESSAGE,
    messageIndex,
  };
}

export function setInfoMessage(message) {
  return {
    type: SET_INFO_MESSAGE,
    message,
  };
}

export function clearInfoMessage(messageIndex) {
  return {
    type: CLEAR_INFO_MESSAGE,
    messageIndex,
  };
}
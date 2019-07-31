// available actions
export const SET_NAV_INFO = 'wordgrid2/navInfo/SET_NAV_INFO';
export const CLEAR_NAV_INFO = 'wordgrid2/navInfo/CLEAR_NAV_INFO';

// initial state
const initialState = {
  backRoute: null,
  backTitle: null,
  pageTitle: null,
};

// reducer
export default function reducer(state = initialState, action) {
  switch(action.type) {
    case SET_NAV_INFO:
      return setNavInfoReducer(state, action);
    case CLEAR_NAV_INFO:
      return clearNavInfoReducer(state, action);
    default:
      return {...state};
  }
}

// action reducers
function setNavInfoReducer(state, action) {
  const { newInfo } = action;
  return {
    ...state,
    backRoute: newInfo.backRoute ? newInfo.backRoute : state.backRoute,
    backTitle: newInfo.backTitle ? newInfo.backTitle : state.backTitle,
    pageTitle: newInfo.pageTitle ? newInfo.pageTitle : state.pageTitle,
  };
}

function clearNavInfoReducer() {
  return initialState;
}

// action creators
export function clearNavInfo() {
  return {
    type: CLEAR_NAV_INFO,
  };
}

export function setNavInfo(newInfo) {
  return {
    type: SET_NAV_INFO,
    newInfo,
  };
}

export function setBackRouteFromHistory(history) {
  return {
    type: SET_NAV_INFO,
    newInfo: {},
  };
}
import firebase from 'react-native-firebase';

// available actions
export const LOGIN_START = 'wordgrid2/login/LOGIN_START';
export const LOGIN_SUCCESS = 'wordgrid2/login/LOGIN_SUCCESS';
export const LOGIN_FAIL = 'wordgrid2/login/LOGIN_FAIL';
export const SAVE_START = 'wordgrid2/login/SAVE_START';
export const SAVE_END = 'wordgrid2/login/SAVE_END';

// initial state
const initialState = {
  loginStarted: false,
  loggedIn: false,
  username: "",
  saving: false,
};

// reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_START:
      return { ...state, username: "started", loginStarted: true };
    case LOGIN_SUCCESS:
      return { ...state, username: "one logged in broseph", loggedIn: true, loginStarted: false };
    case LOGIN_FAIL:
      return { ...state, loginStarted: false };
    case SAVE_START:
      return { ...state, saving: true };
    case SAVE_END:
      return { ...state, saving: false };
    default:
      return state;
  }
}

// action creators
export function userLogin() {
  return (dispatch) => {
    dispatch(userLoginStart());

    firebase.auth().signInAnonymously()
    .then((user) => {
      console.log("login success");
      console.log('user:', user);
      dispatch(userLoginSuccess());
    })
    .catch((e) => {
      console.log("login error, yo");
      console.log(e);
      dispatch(userLoginFail());
    });
  }
}

function userLoginStart() {
  return {
    type: LOGIN_START
  }
}

function userLoginFail() {
  return {
    type: LOGIN_FAIL
  }
}

function userLoginSuccess() {
  return {
    type: LOGIN_SUCCESS
  }
}

export function startSave() {
  console.log('startSave()');
  return {
    type: SAVE_START,
  }
}

export function endSave() {
  console.log('endSave()');
  return {
    type: SAVE_END,
  }
}
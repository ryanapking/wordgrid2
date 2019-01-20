import firebase from 'react-native-firebase';
import { startListeners } from "../remote";
import { retrieveChallengeAttempts } from "../async-storage";
import { setAttemptsHistory } from "./challengeData";
import { setLocalGameDataByID } from "./gameData";

import { checkUser } from "../back4app/client/user";
import { startGamesLiveQuery } from "../back4app/client/listeners";

// available actions
export const LOGIN_START = 'wordgrid2/login/LOGIN_START';
export const LOGIN_SUCCESS = 'wordgrid2/login/LOGIN_SUCCESS';
export const LOGIN_FAIL = 'wordgrid2/login/LOGIN_FAIL';
export const LOGIN_LOST = 'wordgrid2/login/LOGIN_LOST';

// initial state
const initialState = {
  loginStarted: false,
  loggedIn: false,
  username: "",
  uid: null
};

// reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_START:
      return { ...state, username: "started", loginStarted: true };
    case LOGIN_SUCCESS:
      return { ...state, username: "one logged in broseph", loggedIn: true, uid: action.uid, loginStarted: false };
    case LOGIN_FAIL:
      return { ...state, loginStarted: false };
    case LOGIN_LOST:
      return { ...state, uid: null };
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
        dispatch(userLoginSuccess(user.uid));
      })
      .catch((e) => {
        console.log("login error, yo");
        console.log(e);
        dispatch(userLoginFail());
      });
  }
}

export function fetchUser() {
  return (dispatch) => {
    checkUser()
      .then( (userID) => {
        dispatch(userLoginSuccess(userID));
      })
      .catch( (err) => {
        dispatch(userLoggedOut());
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

function userLoginSuccess(uid) {
  console.log('userLoginSuccess()');
  return (dispatch) => {
    startListeners(uid);

    // convoluted, but redux and back4app have to interact somewhere
    // callback is used whenever remote data is changed
    // we call it here to limit it to 1 instance of the listeners
    startGamesLiveQuery((source) => {
        dispatch(setLocalGameDataByID(source.objectId, uid, source));
    });
    // retrieveChallengeAttempts(uid)
    //   .then((history) => {
    //     if (history) {
    //       dispatch(setAttemptsHistory(history));
    //     }
    //   });
    dispatch({
      type: LOGIN_SUCCESS,
      uid
    });
  }
}

function userLoggedOut() {
  return {
    type: LOGIN_LOST
  }
}
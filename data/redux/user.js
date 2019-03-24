import { setLocalGameDataByID } from "./gameData";

import { checkUser, anonymousLogin, standardLogin, createAccount } from "../parse-client/user";
import { startGamesLiveQuery } from "../parse-client/listeners";

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
export function userAnonymousLogin() {
  return (dispatch) => {
    dispatch(userLoginStart());

    anonymousLogin()
      .then( (userID) => {
        dispatch(userLoginSuccess(userID));
      })
      .catch( (err) => {
        console.log('anonymous login error:', err);
        dispatch(userLoginFail());
      });
  }
}

export function userStandardLogin(username, password) {
  return (dispatch) => {

    console.log('standardLogin action creator');
    console.log({username, password});

    dispatch(userLoginStart());

    standardLogin(username, password)
      .then( (user) => {
        console.log('returned after login:', user);
        dispatch(userLoginSuccess(user.id));
      })
      .catch( (err) => {
        console.log('standard login error:', err);
        dispatch(userLoginFail());
      });
  }
}

export function userCreateAccount(email, username, password) {
  return (dispatch) => {
    console.log('creating account');
    console.log({email, username, password});

    dispatch(userLoginStart());

    createAccount(email, username, password)
      .then( (user) => {
        console.log('user account created:', user);
        dispatch(userLoginSuccess(user.id));
      })
      .catch( (err) => {
        console.log('account creation error:', err);
        dispatch(userLoginFail());
      });
  }
}

export function fetchUser(routerHistory) {
  return (dispatch) => {
    checkUser()
      .then( (userID) => {
        console.log('user id:', userID);
        dispatch(userLoginSuccess(userID, routerHistory));
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

function userLoginSuccess(uid, routerHistory) {
  console.log('userLoginSuccess()');
  return (dispatch, getState) => {

    // we start the listener here to limit it to 1 instance
    // callbacks are used when query gets new or updated remote data

    // updates the local data
    const onChange = (source) => {
      dispatch(setLocalGameDataByID(source.objectId, uid, source));
    };

    // updates the local data and redirects the user to the newly created game
    const onCreate = (source) => {
      dispatch(setLocalGameDataByID(source.objectId, uid, source));

      // check for the above to complete before trying to load the game
      // then redirect the user to the new game
      let intervalCounter = 0;
      let waitInterval = setInterval(() => {
        intervalCounter++;
        const gameIDs = Object.keys(getState().gameData.byID);
        if (gameIDs.includes(source.objectId)) {
          routerHistory.push(`/game/${source.objectId}`);
          clearInterval(waitInterval);
        } else if (intervalCounter > 10) {
          clearInterval(waitInterval);
        }
      }, 100);

    };

    startGamesLiveQuery(onChange, onCreate)
      .catch( (err) => {
        console.log('error starting live query:', err);
      });

    dispatch({
      type: LOGIN_SUCCESS,
      uid
    });
  }
}

export function userLoggedOut() {
  return {
    type: LOGIN_LOST
  }
}
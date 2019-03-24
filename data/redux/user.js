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

    // start the parse live query
    // send router history so it has the ability to redirect the app
    startGamesLiveQuery(routerHistory)
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
import { setLocalGameDataByID, removeLocalGameByID, removeAllLocalGames } from "./gameData";

import { checkUser, anonymousLogin, standardLogin, createAccount } from "../parse-client/user";
import { startGamesLiveQuery, stopGamesLiveQuery } from "../parse-client/listeners";
import { setErrorMessage } from "./messages";

// available actions
export const LOGIN_START = 'wordgrid2/login/LOGIN_START';
export const LOGIN_SUCCESS = 'wordgrid2/login/LOGIN_SUCCESS';
export const LOGIN_FAIL = 'wordgrid2/login/LOGIN_FAIL';
export const LOGIN_LOST = 'wordgrid2/login/LOGIN_LOST';
export const START_FETCHING_USER = 'wordgrid2/login/START_FETCHING_USER';
export const END_FETCHING_USER = 'wordgrid2/login/END_FETCHING_USER';

// initial state
const initialState = {
  fetchingUser: false,
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
    case START_FETCHING_USER:
      return { ...state, fetchingUser: true };
    case END_FETCHING_USER:
      return { ...state, fetchingUser: false };
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
    dispatch(startFetchingUser());
    checkUser()
      .then( (userID) => {
        if (userID) dispatch(userLoginSuccess(userID, routerHistory));
      })
      .catch( (err) => {
        dispatch(setErrorMessage(err));
        dispatch(userLoggedOut());
      })
      .finally(() => {
        dispatch(endFetchingUser());
      });
  }
}

export function startFetchingUser() {
  console.log('startFetchingUser()');
  return {
    type: START_FETCHING_USER,
  }
}

export function endFetchingUser() {
  console.log('endFetchingUser()');
  return {
    type: END_FETCHING_USER,
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

    // these functions are passed to the listener so it can manipulate the state when games are updated
    // (importing the store directing into the listener creates a require cycle)
    // it happens here so only one listener is created
    const storeGame = (game) => {
      dispatch(
        setLocalGameDataByID(game.objectId, getState().user.uid, game)
      );
    };

    const storeGameThenRedirect = (game) => {
      dispatch(
        setLocalGameDataByID(game.objectId, getState().user.uid, game)
      );

      // redirect to the new game once it's saved to local storage
      let intervalCounter = 0;
      let waitInterval = setInterval(() => {
        intervalCounter++;
        const gameIDs = Object.keys(getState().gameData.byID);
        if (gameIDs.includes(game.objectId)) {
          routerHistory.push(`/game/${game.objectId}`);
          clearInterval(waitInterval);
        } else if (intervalCounter > 10) {
          clearInterval(waitInterval);
        }
      }, 250);
    };

    const removeGame = (gameID) => {
      dispatch(
        removeLocalGameByID(gameID)
      );
    };

    const removeAllGames = () => {
      dispatch(
        removeAllLocalGames()
      );
    };

    // start the parse live query
    // send router history so it has the ability to redirect the app
    startGamesLiveQuery(storeGame, storeGameThenRedirect, removeGame, removeAllGames)
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
  stopGamesLiveQuery();
  return {
    type: LOGIN_LOST
  }
}

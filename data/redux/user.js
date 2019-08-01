import { setLocalGameDataByID, removeLocalGameByID, removeAllLocalGames } from "./gameData";

import { checkUser, anonymousLogin, standardLogin, createAccount, updateLocalUserDataFromParse } from "../parse-client/user";
import { startGamesLiveQuery, stopGamesLiveQuery } from "../parse-client/listeners";
import { setErrorMessage } from "./messages";

// available actions
export const LOGIN_START = 'wordgrid2/login/LOGIN_START';
export const LOGIN_SUCCESS = 'wordgrid2/login/LOGIN_SUCCESS';
export const LOGIN_FAIL = 'wordgrid2/login/LOGIN_FAIL';
export const LOGIN_LOST = 'wordgrid2/login/LOGIN_LOST';
export const START_FETCHING_USER = 'wordgrid2/login/START_FETCHING_USER';
export const END_FETCHING_USER = 'wordgrid2/login/END_FETCHING_USER';
export const UPDATE_FRIENDS_DATA = 'wordgrid2/login/UPDATE_FRIENDS_DATA';
export const UPDATE_USER_DATA = "wordgrid2/login/UPDATE_USER_DATA";

// initial state
const initialState = {
  fetchingUser: false,
  loginStarted: false,
  isAnonymous: true,
  username: "",
  uid: null,
  wins: 0,
  losses: 0,
  friends: [], // array of friend IDs
  friendsByID: {},
};

// reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_START:
      return { ...state, loginStarted: true };
    case LOGIN_SUCCESS:
      return { ...state, uid: action.uid, loginStarted: false };
    case LOGIN_FAIL:
      return { ...state, loginStarted: false };
    case LOGIN_LOST:
      return { ...state, uid: null };
    case START_FETCHING_USER:
      return { ...state, fetchingUser: true };
    case END_FETCHING_USER:
      return { ...state, fetchingUser: false };
    case UPDATE_FRIENDS_DATA:
      return { ...state, friendsByID: action.friendsByID };
    case UPDATE_USER_DATA:
      return updateUserDataReducer(state, action);
    default:
      return state;
  }
}

// individual reducer functions
function updateUserDataReducer(state, action) {
  const updatedUser = action.user;

  let updatedFriends = [];
  let updatedFriendsByID = {};
  if (updatedUser.friends) {
    updatedUser.friends.forEach((friend) => {
      updatedFriends.push(friend.objectId);
      updatedFriendsByID[friend.objectId] = friend;
    });
  }

  // TODO: may need another way of determining if a user is anonymous

  return {
    ...state,
    isAnonymous: !updatedUser.hasOwnProperty('email'),
    username: updatedUser.username ? updatedUser.username : state.username,
    uid: updatedUser.objectId ? updatedUser.objectId : state.uid,
    wins: updatedUser.wins ? updatedUser.wins : state.wins,
    losses: updatedUser.losses ? updatedUser.losses : state.losses,
    friends: updatedFriends ? updatedFriends : state.friends,
    friendsByID: updatedFriendsByID ? updatedFriendsByID : state.friendsByID,
  }
}

// action creators
export function userAnonymousLogin(routerHistory) {
  return (dispatch) => {
    dispatch(userLoginStart());

    anonymousLogin()
      .then( (user) => {
        dispatch(userLoginSuccess(user, routerHistory));
      })
      .catch( (err) => {
        console.log('anonymous login error:', err);
        dispatch(userLoginFail());
      });
  }
}

export function userStandardLogin(username, password, routerHistory) {
  return (dispatch) => {

    console.log('standardLogin action creator');
    console.log({username, password});

    dispatch(userLoginStart());

    standardLogin(username, password)
      .then( (user) => {
        console.log('returned after login:', user);
        dispatch(userLoginSuccess(user, routerHistory));
      })
      .catch( (err) => {
        console.log('standard login error:', err);
        dispatch(userLoginFail());
      });
  }
}

export function userCreateAccount(email, username, password, routerHistory) {
  return (dispatch) => {
    console.log('creating account');
    console.log({email, username, password});

    dispatch(userLoginStart());

    createAccount(email, username, password)
      .then( (user) => {
        console.log('user account created:', user);
        dispatch(userLoginSuccess(user, routerHistory));
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
      .then( (user) => {
        console.log('redux fetchUser() user:', user);
        if (user) {
          dispatch(userLoginSuccess(user, routerHistory));
          dispatch(refreshLocalUserInfo());
        }
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
  return {
    type: START_FETCHING_USER,
  }
}

export function endFetchingUser() {
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

function userLoginSuccess(user, routerHistory) {
  console.log('userLoginSuccess()');
  console.log('user:', user);
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
      uid: user.objectId,
    });

    dispatch(refreshLocalUserInfo());
  }
}

export function userLoggedOut() {
  stopGamesLiveQuery();
  return {
    type: LOGIN_LOST
  }
}

export function refreshLocalUserInfo() {
  return (dispatch) => {
    updateLocalUserDataFromParse()
      .then((user) => {
        dispatch(setUserData(user));
      })
      .catch((err) => {
        dispatch(setErrorMessage(err));
      });
  }
}

export function setUserData(user) {
  return {
    type: UPDATE_USER_DATA,
    user,
  };
}

// centralized point for complex action creators that use thunk to make remote calls and/or string together other action creators

import {
  anonymousLogin,
  checkUser,
  createAccount,
  standardLogin,
  updateLocalUserDataFromParse
} from "../parse-client/user";
import {
  addFriend as parseAddFriend,
  removeFriend as parseRemoveFriend,
} from "../parse-client/actions";
import {
  endFetchingUser,
  userLoginSuccess,
  setUserData,
  startFetchingUser,
  userLoginFail,
  userLoginLost,
  userLoginStart
} from "./user";
import {
  logout,
  updateExistingAccount,
  convertAnonymousAccount as parseConvertAnonymousAccount
} from "../parse-client/user";
import { setErrorMessage, setInfoMessage } from "./messages";
import { startGamesLiveQuery, stopGamesLiveQuery } from "../parse-client/listeners";
import { removeAllLocalGames, removeLocalGameByID, setLocalGameDataByID } from "./gameData";

export function userAnonymousLogin(routerHistory) {
  return async (dispatch) => {
    dispatch(userLoginStart());

    const user = await anonymousLogin()
      .catch((err) => {
        console.log('anonymous login error:', err);
        dispatch(userLoginFail());
      });

    dispatch(loginComplete(user, routerHistory));
  }
}

export function userStandardLogin(username, password, routerHistory) {
  return async (dispatch) => {
    dispatch(userLoginStart());

    const user = await standardLogin(username, password)
      .catch((err) => {
        console.log('standard login error:', err);
        dispatch(userLoginFail());
      });

    dispatch(loginComplete(user, routerHistory));
  }
}

export function userCreateAccount(email, username, password, routerHistory) {
  return async (dispatch) => {
    dispatch(userLoginStart());

    const user = await createAccount(email, username, password)
      .catch((err) => {
        console.log('account creation error:', err);
        dispatch(userLoginFail());
      });

    dispatch(loginComplete(user, routerHistory));
  }
}

// queries parse for an updated user object
export function refreshLocalUserInfo() {
  return async (dispatch) => {
    const user = await updateLocalUserDataFromParse()
      .catch((err) => {
        dispatch(setErrorMessage(err));
      });

    dispatch(setUserData(user));
  }
}

export function userLoggedOut() {
  return (dispatch) => {
    stopGamesLiveQuery();
    dispatch(removeAllLocalGames());
    dispatch(userLoginLost());
  }
}

export function userLogout() {
  return async (dispatch) => {
    await logout()
      .catch((err) => {
        console.log('error logging out', err);
      });
    dispatch(userLoggedOut());
  }
}

// checks Parse local data store for a logged in user
export function fetchUser(routerHistory) {
  return async (dispatch) => {
    dispatch(startFetchingUser());

    const user = await checkUser()
      .catch((err) => {
        dispatch(setErrorMessage(err));
        dispatch(userLoggedOut());
        dispatch(endFetchingUser());
      });

    dispatch(endFetchingUser());
    if (user) {
      dispatch(loginComplete(user, routerHistory));
      dispatch(refreshLocalUserInfo());
    }
  }
}

// initiates Parse listener
// provides functions to Parse listener for manipulating redux data
// initiates refresh of user data
export function loginComplete(user, routerHistory) {
  const uid = user.objectId;
  return (dispatch, getState) => {

    // these functions are passed to the listener so it can manipulate the state when games are updated
    // (importing the store directly into the listener creates a require cycle)
    // it happens here so only one listener is created
    const storeGame = (game) => {
      dispatch(
        setLocalGameDataByID(game.objectId, uid, game)
      );
    };

    const storeGameThenRedirect = (game) => {
      dispatch(
        setLocalGameDataByID(game.objectId, uid, game)
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
      .catch((err) => {
        console.log('error starting live query:', err);
      });

    dispatch(userLoginSuccess());
    dispatch(refreshLocalUserInfo());
  }
}

export function updateAccount(newEmail, newUsername, newPassword) {
  console.log('updateAccount() action creator');
  return async (dispatch) => {
    await updateExistingAccount(newEmail, newUsername, newPassword)
      .catch( (err) => {
        dispatch(setErrorMessage(err));
      });
    dispatch(refreshLocalUserInfo());
    dispatch(setInfoMessage("Account updated"));
  }
}

export function convertAnonymousAccount(email, username, password) {
  return async (dispatch) => {
    await parseConvertAnonymousAccount(email, username, password)
      .catch( (err) => {
        dispatch(setErrorMessage(err));
      });
    dispatch(refreshLocalUserInfo());
    dispatch(setInfoMessage("Account Registered"));
  }
}

export function addFriend(friendID) {
  return async (dispatch) => {
    await parseAddFriend({friendID})
      .catch(err => dispatch(setErrorMessage(err)));
    dispatch(refreshLocalUserInfo());
  }
}

export function removeFriend(friendID) {
  return async (dispatch) => {
    await parseRemoveFriend({friendID})
      .catch(err => dispatch(setErrorMessage(err)));
    dispatch(refreshLocalUserInfo());
  }
}
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
  email: "",
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
    email: updatedUser.email ? updatedUser.email : state.email,
    uid: updatedUser.objectId ? updatedUser.objectId : state.uid,
    wins: updatedUser.wins ? updatedUser.wins : state.wins,
    losses: updatedUser.losses ? updatedUser.losses : state.losses,
    friends: updatedFriends ? updatedFriends : state.friends,
    friendsByID: updatedFriendsByID ? updatedFriendsByID : state.friendsByID,
  }
}

// action creators
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

export function userLoginStart() {
  return {
    type: LOGIN_START
  }
}

export function userLoginFail() {
  return {
    type: LOGIN_FAIL
  }
}

export function userLoginLost() {
  return {
    type: LOGIN_LOST,
  }
}

export function setUserData(user) {
  return {
    type: UPDATE_USER_DATA,
    user,
  }
}

export function userLoginSuccess(uid) {
  return {
    type: LOGIN_SUCCESS,
    uid,
  }
}
import firebase from 'react-native-firebase';

import { store } from '../../App';
import { setSourceChallengeData } from "../redux/challengeData";
import { setLocalGameDataByID, setOpponentName } from "../redux/gameData";

let challengeListener = null;
let userListener = {
  userID: null,
  listener: null,
};
let gameListeners = {
  ids: [],
  listeners: {},
};

export function startListeners(userID) {
  // startChallengeListener();
  // startUserListener(userID);
}

function startChallengeListener() {
  // console.log('startChallengeListener()');
  const challengeDocRef = firebase.firestore().collection('challenge').doc('daily');

  challengeListener = challengeDocRef.onSnapshot( (challengeDoc) => {
    if (!challengeDoc.exists) return;
    // console.log('challenge doc:', challengeDoc.data());
    store.dispatch(setSourceChallengeData(challengeDoc.data()));
  });
}

function stopChallengeListener() {
  challengeListener();
  challengeListener = null;
}






function startUserListener(userID) {
  // console.log('startUserListener()', userID);
  userListener.userID = userID;
  const userDocRef = firebase.firestore().collection('users').doc(userID);

  userListener.listener = userDocRef.onSnapshot( (userDoc) => {
    if (!userDoc.exists) return;
    const gameIDs = userDoc.data().games ? userDoc.data().games : [];

    // console.log('gameIDs', gameIDs);

    const newGameIDs = gameIDs.filter( (gameID) => !gameListeners.ids.includes(gameID));
    newGameIDs.forEach( (gameID) => {
      startGameListener(userID, gameID);
    });

    const defunctGameIDs = gameListeners.ids.filter( (gameID) => !gameIDs.includes(gameID));
    defunctGameIDs.forEach( (gameID) => {
      stopGameListener(userID, gameID);
    });
  });
}

function stopUserListener() {
  userListener.listener();
  userListener = {
    userID: null,
    listener: null,
  };
  stopAllGameListeners();
}





function startGameListener(userID, gameID) {
  // console.log('startGameListener()');
  // console.log('user id:', userID);
  // console.log('game id:', gameID);

  const gameDocRef = firebase.firestore().collection('games').doc(gameID);

  let gameListener = gameDocRef.onSnapshot( (gameDoc) => {
    if (!gameDoc.exists) return;
    store.dispatch(setLocalGameDataByID(gameID, userID, gameDoc.data()));
    store.dispatch(setOpponentName(gameID));
  });

  gameListeners.ids.push(gameID);
  gameListeners.listeners[gameID] = gameListener;
}

function stopGameListener(gameID) {
  // console.log('stopGameListener()', gameID);

  gameListeners.listeners[gameID]();
  delete gameListeners.listeners[gameID];
  gameListeners.ids = gameListeners.ids.filter( (currentID) => currentID !== gameID);
}

function stopAllGameListeners() {
  gameListeners.listeners.forEach( (listener) => {
    listener();
  });
  gameListeners = {
    ids: [],
    listeners: {},
  }
}
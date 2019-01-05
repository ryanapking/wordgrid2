import firebase from 'react-native-firebase';

import { store } from '../../App';
import { startSave, endSave } from "../redux/login";
import { generateGame } from "../utilities";

export async function initiateGame(userID) {
  store.dispatch(startSave());

  // find an existing game to join
  const existingGame = await findExistingGame(userID);

  let joinGameSuccess = false;

  // join the existing game
  if (existingGame) {
    joinGameSuccess = await joinExistingGame(userID, existingGame);
  }

  // if no existing game found or join failed, create a new game
  if (!joinGameSuccess) {
    await createNewGame(userID);
  }

  store.dispatch(endSave());
}

function findExistingGame(userID) {
  console.log('findExistingGame()');
  return new Promise( (resolve, reject) => {

    firebase.firestore()
      .collection('games')
      .where( "t", "==", "p2" )
      .where( "p2", "==", null )
      .limit(1)
      .get()
      .then( (games) => {

        // game found
        if (games.docs.length > 0) {

          const existingGameDoc = games.docs[0];

          // inequality queries don't exist in firestore
          // if we happened to grab our own game, then we are out of luck
          if (existingGameDoc.data().p1 === userID) {
            console.log('we grabbed our own game!');
            resolve(null);
            return;
          }

          resolve(existingGameDoc);

        } else {
          console.log('found no game to join.');
          resolve(null);
        }
      })
      .catch( (err) => {
        // query failed
        // (failure is not the same as no results. probably connection issues.)
        // should create a component for displaying such error messages
        console.log('err', err);
        reject(err);
      });

  });
}

function joinExistingGame(userID, existingGame) {
  console.log('joinExistingGame()');
  return new Promise( (resolve) => {

    const userDocRef = firebase.firestore().collection('users').doc(userID);
    const joinGameDocRef = firebase.firestore().collection('games').doc(existingGame.id);

    // try to claim the game in firebase
    firebase.firestore().runTransaction( (transaction) => {
      return transaction.get(userDocRef).then( (userDoc) => {

        if (!userDoc.exists) {
          transaction.set(userDocRef, {
            games: [joinGameID]
          });
        } else {
          const currentUserGames = userDoc.data().games ? userDoc.data().games : [];
          transaction.update(userDocRef, {
            games: [ ...currentUserGames, joinGameID ]
          });
        }

        transaction.update(joinGameDocRef, {
          t: userID, // insert own uid as next move
          p2: userID, // insert own uid as player 2
          m: firebase.firestore.FieldValue.serverTimestamp(), // timestamp modification time
        });

      }).then( () => {
        console.log('join game success');
        resolve(true);
      }).catch( () => {
        // Probably not an error. Someone else might have already joined the game.
        console.log('failed to join game. creating a new one...');
        resolve(false);
      });
    });

  });
}

function createNewGame(userID) {
  console.log('createNewGame()');
  const userDocRef = firebase.firestore().collection('users').doc(userID);
  const newGameDocRef = firebase.firestore().collection('games').doc();
  const newGameID = newGameDocRef.id;
  const newGameData = generateGame(userID);
  // add timestamps that will be set in firestore
  newGameData.c = firebase.firestore.FieldValue.serverTimestamp(); // creation timestamp
  newGameData.m = firebase.firestore.FieldValue.serverTimestamp(); // modification timestamp

  return firebase.firestore().runTransaction( (transaction) => {

    return transaction.get(userDocRef).then( (userDoc) => {

      if (!userDoc.exists) {
        transaction.set(userDocRef, {
          games: [newGameID]
        });
      } else {
        const currentUserGames = userDoc.data().games ? userDoc.data().games : [];
        transaction.update(userDocRef, {
          games: [ ...currentUserGames, newGameID ]
        });
      }

      transaction.set(newGameDocRef, newGameData );

    });

  }).catch( (err) => {
    // we need to print an error to the screen here
    console.log('create new game error:', err);
  });
}
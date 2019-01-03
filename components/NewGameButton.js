import React, { Component } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { Button, Spinner } from 'native-base';
import firebase from "react-native-firebase";

import { generateGame } from "../data/utilities";

class NewGameButton extends Component {
  constructor() {
    super();

    this.state = {
      working: false,
    };

    this.newGame = this.newGame.bind(this);
    this.joinRemoteGame = this.joinRemoteGame.bind(this);
    this.createRemoteGame = this.createRemoteGame.bind(this);
  }

  render() {

    if (this.state.working) {
      return (
        <Button full info disabled>
          <Spinner color='blue' />
        </Button>
      );
    }

    return (
      <Button full info onPress={() => this.newGame()}>
        <Text>New Game</Text>
      </Button>
    );

  }

  newGame() {

    // tries to join an existing remote game
    // if that doesn't work, creates a remote game

    this.setState({
      working: true
    });

    new Promise( this.joinRemoteGame )
      .then( (something) => {
        console.log('something', something);
        this.setState({
          working: false
        })
      })
      .catch( (err) => {
        console.log('REJECTED!', err);

        new Promise( this.createRemoteGame )
          .then( (something) => {
            console.log(something);
          })
          .catch( (err) => {
            console.log('create failed!', err);
          })
          .finally( () => {
            console.log('last thing, i hope');
            this.setState({
              working: false
            })
          });

      });
  }

  joinRemoteGame(resolve, reject) {

    const userID = this.props.uid;
    const gamesCollectionRef = firebase.firestore().collection('games');
    const userDocRef = firebase.firestore().collection('users').doc(userID);

    // query to find a game waiting for a partner
    return gamesCollectionRef
      .where( "t", "==", "p2" )
      .where( "p2", "==", null )
      .limit(1)
      .get()
      .then( (games) => {

        console.log('games', games);

        // game found
        if (games.docs.length > 0) {

          const gameDoc = games.docs[0];
          const joinGameID = gameDoc.id;
          const joinGameDocRef = gamesCollectionRef.doc(gameDoc.id);

          // inequality queries don't exist in firestore
          // if we happened to grab our own game, then we are out of luck
          if (gameDoc.data().p1 === userID) {
            reject('we grabbed our own game! creating a new one...');
            return;
          }

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
              resolve('join game success');
            }).catch( () => {
              reject('failed to join game. creating a new one...');
            });
          });

        } else {
          reject('found no game to join. creating a new one...');
        }
      })
      .catch( (err) => {
        // query failed
        // (failure is not the same as no results. probably connection issues)
        console.log('err', err);
      });

  }

  createRemoteGame(resolve, reject) {

    const userID = this.props.uid;
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

        console.log('gameDocRef:', newGameDocRef);

      });

    }).then( () => {
      resolve('sweet game save successsssss');
    }).catch( (err) => {
      reject(err);
    });

  }
}

const mapStateToProps = (state) => {
  return {
    uid: state.user.uid,
  };
};

export default withRouter(connect(mapStateToProps)(NewGameButton));
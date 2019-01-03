import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import firebase from 'react-native-firebase';

import {
  setLocalGameDataByID,
  setLocalGameIDs,
  removeLocalGameByID,
  setOpponentName
} from "../../data/redux/gameData";
import { setSourceChallengeData } from "../../data/redux/challengeData";

class FirebaseListeners extends Component {
  constructor() {
    super();

    this.state = {
      gameListenerIDs: [],
      gameListeners: {},
      userListenerID: null,
      userListener: null,
      challengeListener: null,
    };

    this.manageRemoteGameListSync = this.manageRemoteGameListSync.bind(this);
    this.manageRemoteGameSyncs = this.manageRemoteGameSyncs.bind(this);
  }

  render() {
    return null;
  }

  componentWillUnmount() {
    console.log('firebase listeners component will unmount');
  }

  componentDidMount() {
    this.manageRemoteGameListSync();
    this.startChallengeSync();
  }

  componentDidUpdate() {
    this.manageRemoteGameListSync();
  }

  startChallengeSync() {
    const challengeDocRef = firebase.firestore().collection('challenge').doc('daily');

    const challengeListener = challengeDocRef.onSnapshot( (challengeDoc) => {
      if (!challengeDoc.exists) return;
      // console.log('challenge doc:', challengeDoc.data());
      this.props.setSourceChallengeData(challengeDoc.data());
    });

    this.setState({challengeListener});
  }

  manageRemoteGameListSync() {

    // we probably don't need to do anything and don't want to repeat this function to prevent duplicate listeners
    if ( this.props.userID === this.state.userListenerID ) {
      return;
    } else if ( this.state.userListener ) {
      // unsets existing user sync
      this.state.userListener();
    }

    // console.log('user game list sync starting');

    const userDocRef = firebase.firestore().collection('users').doc(this.props.userID);

    const userListener = userDocRef.onSnapshot( (userDoc) => {
      if (!userDoc.exists) return;
      const gameIDs = userDoc.data().games ? userDoc.data().games : [];
      this.props.setLocalGameIDs(gameIDs);
      this.manageRemoteGameSyncs(gameIDs, this.props.userID);
    });

    this.setState({
      userListenerID: this.props.userID,
      userListener
    });

  }

  manageRemoteGameSyncs(gameIDs, userID) {

    // grab the already present listeners, to prevent duplicates
    const alreadyListening = this.state.gameListenerIDs;

    // figure out which new listeners would be duplicates
    // add the other listeners
    gameIDs.filter( (gameID) => {
      return !alreadyListening.includes(gameID);
    }).forEach( (gameID) => {

      // console.log('starting sync for new game:', gameID);
      const gameDocRef = firebase.firestore().collection('games').doc(gameID);

      let gameListener = gameDocRef.onSnapshot( (gameDoc) => {
        if (!gameDoc.exists) return;
        this.props.setLocalGameDataByID(gameID, userID, gameDoc.data());
        this.getOpponentName(gameID);
      });

      this.setState({
        gameListeners: {...this.state.gameListeners, [gameID]: gameListener}
      });

    });

    // our list of local games should now reflect the remote list
    this.setState({
      gameListenerIDs: gameIDs
    });

    // remove any defunct listeners
    for (let gameID in this.state.gameListeners) {
      if (!this.state.gameListenerIDs.includes(gameID)) {
        console.log('game defunct. removing listener...');
        this.state.gameListeners[gameID]();
        this.props.removeLocalGameByID(gameID);
      }
    }

    // create a new object describing and containing the current remote game listeners
    const gameListeners = {};
    this.state.gameListenerIDs.forEach( (gameID) => {
      gameListeners[gameID] = this.state.gameListeners[gameID];
    });
    this.setState({
      gameListeners
    });

  }

  getOpponentName(gameID) {

    const game = this.props.gamesByID[gameID];
    const opponentID = game.opponentID;

    if (!opponentID) return;

    firebase.firestore().collection('displayNames')
      .where("id", "==", opponentID)
      .limit(1)
      .get()
      .then( (results) => {
        // console.log('name search complete');
        if (results.docs.length > 0) {
          this.props.setOpponentName(gameID, results.docs[0].id);
        }
      })
      .catch( (err) => {
        console.log('error fetching opponent:', err);
      })
      .finally( () => {
        // console.log('finally...');
      });

  }

}

const mapStateToProps = (state) => {
  return {
    userID: state.user.uid,
    gamesByID: state.gameData.byID,
    challengeData: state.challengeData,
  };
};

const mapDispatchToProps = {
  setOpponentName,
  setLocalGameDataByID,
  setLocalGameIDs,
  removeLocalGameByID,
  setSourceChallengeData,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FirebaseListeners));
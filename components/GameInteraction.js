import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';
import firebase from 'react-native-firebase';
import { Button, Container, Spinner } from "native-base";

import DrawPieceSection from "./DrawPieceSection";

import {calculateWordValue, getWinner, localToRemote} from "../data/utilities";
import { setLocalGameDataByID, playWord } from "../data/redux/gameData";

class GameInteraction extends Component {
  constructor() {
    super();

    this.state = {
      working: false
    };

    this.saveRemoteMove = this.saveRemoteMove.bind(this);
  }

  render() {
    const wordPlayed = !!this.props.game.word;

    if (this.state.working) {
      return this._Spinner();
    } else if (!wordPlayed) {
      return this._playWordInteraction();
    } else if (!this.props.game.piecePlaced) {
      return this._placePieceInteraction();
    } else {
      return this._confirmMoveInteraction();
    }

  }

  _Spinner() {
    return (
      <Container style={this.props.style}>
        <Spinner color='blue' />
      </Container>
    );
  }

  _playWordInteraction() {
    const displayWord = this.props.game.consumedSquares.reduce( (word, square) => word + square.letter, "");
    const longEnough = (displayWord.length >= 4);
    const startMessage = "Drag to spell a word";
    return (
      <Container style={this.props.style}>
        <Container style={[styles.flex]}>
          <DrawPieceSection style={[styles.twoColumns]} pieces={this.props.game.me} />
          <View style={styles.twoColumns}>
            <Text style={{padding: 20, textAlign: 'center'}}>{displayWord ? displayWord : startMessage}</Text>
            { longEnough ? this._playWordButton(displayWord) : null }
          </View>
        </Container>
      </Container>
    );
  }


  _playWordButton(word) {
    return (
      <Button block info onPress={() => this.props.playWord(this.props.gameID, this.props.uid)}>
        <Text>Play word for {calculateWordValue(word)} points</Text>
      </Button>
    );
  }

  _placePieceInteraction() {
    return (
      <Container style={this.props.style}>
        <DrawPieceSection pieces={this.props.game.me} allowDrag />
      </Container>
    );
  }

  _confirmMoveInteraction() {
    return (
      <Container style={this.props.style}>
        <View style={styles.confirmMoveSection}>
          <Button full info onPress={() => this.saveRemoteMove()}><Text>Submit Move</Text></Button>
          <Button full info onPress={() => this.clearLocalMoveData()}><Text>Reset Move</Text></Button>
        </View>
      </Container>
    );
  }

  clearLocalMoveData() {
    this.props.setLocalGameDataByID(this.props.gameID, this.props.uid, this.props.game.sourceData);
  }

  saveRemoteMove() {

    this.setState({
      working: true
    });

    const gameID = this.props.gameID;
    const userID = this.props.uid;
    const localGameData = this.props.game;

    const gameDocRef = firebase.firestore().collection('games').doc(gameID);
    const newMove = localToRemote(localGameData, this.props.uid);

    const newGameObject = {
      ...localGameData,
      history: [
        ...localGameData.history, newMove
      ]
    };

    const winner = getWinner(newGameObject);

    // console.log('new game object', newGameObject);

    firebase.firestore().runTransaction( (transaction) => {

      return transaction.get(gameDocRef).then( (gameDoc) => {

        if (!gameDoc.exists) return;

        // if there is no opponent yet, set the turn to "p2", which will be used for querying games when trying to join a new one
        let turn = "p2";

        // if there is an opponent, set the turn value to their uid
        if (winner) {
          turn = "over";
        } else if ( localGameData.p1 !== null && localGameData.p1 !== userID ) {
          turn = localGameData.p1;
        } else if ( localGameData.p2 !== null && localGameData.p2 !== userID ) {
          turn = localGameData.p2;
        }

        transaction.update(gameDocRef, {
          h: newGameObject.history,
          t: turn,
          w: winner,
          m: firebase.firestore.FieldValue.serverTimestamp(), // timestamp modification time
        });

      });

    }).then( () => {
      console.log('game update succeeded');
    }).catch( (err) => {
      console.log('game update error:', err);
    }).finally( () => {
      this.setState({
        working: false
      })
    });

  }
}

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoColumns: {
    flexBasis: '50%',
    flex: 1,
    maxHeight: '100%',
    maxWidth: '100%',
  },
  confirmMoveSection: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  }
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    gameID: gameID,
    game: state.gameData.byID[gameID],
    uid: state.user.uid
  };
};

const mapDispatchToProps = {
  setLocalGameDataByID,
  playWord,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameInteraction));
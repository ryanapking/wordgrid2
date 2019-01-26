import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';
import { Button, Container, Spinner } from "native-base";

import DrawPieceSection from "./DrawPieceSection";

import { calculateWordValue, getWinner, localToRemote, remoteToLocal, validateMove } from "../data/utilities";
import { setLocalGameDataByID, playWord } from "../data/redux/gameData";
import { saveGame } from '../data/remote/saveGame';
import { saveMove } from "../data/back4app/client/actions";

class GameInteraction extends Component {
  render() {
    const wordPlayed = !!this.props.game.word;

    if (this.props.saving) {
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

    const { gameID, uid, game } = this.props;

    const newMove = localToRemote(game, this.props.uid);
    const originalGameObject = remoteToLocal(game.sourceData, uid);

    // validateMove(originalGameObject, newMove);

    saveMove(gameID, newMove)
      .then(this.props.history.push("/"));

    return;

    // used to figure out if there's a winner
    const tempGameObject = {
      ...game,
      history: [ ...game.history, newMove ]
    };
    const winner = getWinner(tempGameObject);

    // if there is no opponent yet, set the turn to "p2", which will be used for querying games when trying to join a new one
    let turn = "p2";

    // if there is an opponent, set the turn value to their uid
    if (winner) {
      turn = "over";
    } else if ( game.p1 !== null && game.p1 !== uid ) {
      turn = game.p1;
    } else if ( game.p2 !== null && game.p2 !== uid ) {
      turn = game.p2;
    }

    const gameObject = {
      h: tempGameObject.history,
      t: turn,
      w: winner,
    };

    saveGame(gameID, gameObject);
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
    uid: state.user.uid,
    saving: state.login.saving,
  };
};

const mapDispatchToProps = {
  setLocalGameDataByID,
  playWord,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameInteraction));
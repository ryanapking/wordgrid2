import React, { Component } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';

import DrawPieceSection from "./DrawPieceSection";

import { calculateWordValue } from "../data/utilities/functions/calculations";
import { localToRemote } from "../data/utilities/functions/dataConversions";
import { validateMove } from "../data/utilities/functions/checks";
import { playWord, clearConsumedSquares, resetLocalGameDataByID } from "../data/redux/gameData";
import { saveMove } from "../data/parse-client/actions";

class GameInteraction extends Component {
  render() {
    const wordPlayed = !!this.props.game.word;

    if (!wordPlayed) {
      return this._playWordInteraction();
    } else if (!this.props.game.piecePlaced) {
      return this._placePieceInteraction();
    } else {
      return this._confirmMoveInteraction();
    }

  }

  _playWordInteraction() {
    const { gameID } = this.props;
    const displayWord = this.props.game.consumedSquares.reduce( (word, square) => word + square.letter, "");
    const longEnough = (displayWord.length >= 4);
    const startMessage = "Drag to spell a word";
    return (
      <View style={this.props.style}>
        <View style={[styles.flex]}>
          <DrawPieceSection style={[styles.twoColumns]} pieces={this.props.game.currentPlayer.currentPieces} />
          <View style={styles.twoColumns}>
            <TouchableOpacity style={styles.wordDisplaySection} onPress={ () => this.props.clearConsumedSquares(gameID) } >
              <Text>{displayWord ? displayWord : startMessage}</Text>
              { displayWord.length > 0 &&
                <Text style={styles.clearMessage}>(tap to clear word)</Text>
              }
            </TouchableOpacity>
            { longEnough &&
              <Button
                title={`Play word for ${calculateWordValue(displayWord)} points`}
                onPress={ () => this.props.playWord(this.props.gameID, this.props.uid) }
              />
            }
          </View>
        </View>
      </View>
    );
  }

  _placePieceInteraction() {
    return (
      <View style={this.props.style}>
        <DrawPieceSection pieces={this.props.game.currentPlayer.currentPieces} allowDrag />
      </View>
    );
  }

  _confirmMoveInteraction() {
    return (
      <View style={this.props.style}>
        <View style={styles.confirmMoveSection}>
          <Button title="Submit Move" onPress={() => this.saveRemoteMove()} />
          <Button title="Reset Move" onPress={() => this.props.resetLocalGameDataByID(this.props.gameID)} />
        </View>
      </View>
    );
  }

  saveRemoteMove() {
    const {gameID, uid, game} = this.props;
    const newMove = localToRemote(game, uid);

    // nothing currently happens with the validation
    // mainly here to trigger the function for now
    validateMove(uid, game.sourceData, newMove);

    saveMove(gameID, newMove)
      .then((savedGameObject) => {
        this.props.history.push("/");
      });

  }
}

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
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
  },
  wordDisplaySection: {
    alignItems: 'center',
    padding: 20,
    textAlign: 'center',
  },
  clearMessage: {
    opacity: .2,
  },
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    gameID: gameID,
    game: state.gameData.byID[gameID],
    uid: state.user.uid,
  };
};

const mapDispatchToProps = {
  playWord,
  clearConsumedSquares,
  resetLocalGameDataByID,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameInteraction));
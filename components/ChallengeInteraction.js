import React, { Component } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';

import DrawPieceSection from "./DrawPieceSection";
import { calculateWordValue } from "../data/utilities";
import { playWord, clearConsumedSquares } from '../data/redux/challengeData';

class ChallengeInteraction extends Component {
  render() {
    const { challenge } = this.props;
    const { word } = challenge;
    const wordPlayed = !!word;

    // console.log('challenge data:', this.props.challenge);

    if (challenge.gameOver) {
      return this._gameOver();
    } else if (!wordPlayed) {
      return this._playWordInteraction();
    } else {
      return this._placePieceInteraction();
    }
  }

  _gameOver() {
    return (
      <View style={[styles.gameOver, this.props.style]}>
        <Text>Game Over</Text>
      </View>
    );
  }

  _playWordInteraction() {
    const displayWord = this.props.challenge.consumedSquares.reduce( (word, square) => word + square.letter, "");
    const longEnough = (displayWord.length >= 4);
    const startMessage = "Drag to spell a word";
    return (
      <View style={this.props.style}>
        <View style={[styles.flex]}>
          <DrawPieceSection style={[styles.twoColumns]} pieces={this.props.challenge.pieces} />
          <View style={styles.twoColumns}>
            <TouchableOpacity style={styles.wordDisplaySection} onPress={ () => this.props.clearConsumedSquares() } >
              <Text>{displayWord ? displayWord : startMessage}</Text>
              { displayWord.length > 0 &&
                <Text style={styles.clearMessage}>(tap to clear word)</Text>
              }
            </TouchableOpacity>
            { longEnough &&
              <Button
                title={`Play word for ${calculateWordValue(displayWord)} points`}
                onPress={ () => this.props.playWord() }
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
        <DrawPieceSection pieces={this.props.challenge.pieces} allowDrag />
      </View>
    );
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
  gameOver: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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

const mapStateToProps = (state) => {
  return {
    challenge: state.challengeData.challenge,
  };
};

const mapDispatchToProps = {
  playWord,
  clearConsumedSquares,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeInteraction));
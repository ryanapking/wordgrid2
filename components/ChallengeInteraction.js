import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';
import { Button, Container } from "native-base";

import DrawPieceSection from "./DrawPieceSection";
import { calculateWordValue } from "../data/utilities";
import { playWord } from '../data/redux/challengeData';

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
      <Container style={[styles.gameOver, this.props.style]}>
        <Text>Game Over</Text>
      </Container>
    );
  }

  _playWordInteraction() {
    const displayWord = this.props.challenge.consumedSquares.reduce( (word, square) => word + square.letter, "");
    const longEnough = (displayWord.length >= 4);
    const startMessage = "Drag to spell a word";
    return (
      <Container style={this.props.style}>
        <Container style={[styles.flex]}>
          <DrawPieceSection style={[styles.twoColumns]} pieces={this.props.challenge.pieces} />
          <View style={styles.twoColumns}>
            <Text style={{padding: 20, textAlign: 'center'}}>{displayWord ? displayWord : startMessage}</Text>
            { longEnough ? this._playWordButton(displayWord) : null }
          </View>
        </Container>
      </Container>
    );
  }

  _placePieceInteraction() {
    return (
      <Container style={this.props.style}>
        <DrawPieceSection pieces={this.props.challenge.pieces} allowDrag />
      </Container>
    );
  }

  _playWordButton(word) {
    return (
      <Button block info onPress={() => this.props.playWord()}>
        <Text>Play word for {calculateWordValue(word)} points</Text>
      </Button>
    );
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
  gameOver: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    challenge: state.challengeData.challenge,
  };
};

const mapDispatchToProps = {
  playWord
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeInteraction));
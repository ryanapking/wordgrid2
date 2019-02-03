import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';

import ChallengePieceSetDisplay from './ChallengePieceSetDisplay';

class ChallengeInfoDisplay extends Component {
  render() {
    const { moves, score, word } = this.props;

    // const drawHistory
    const movesRemaining = 5 - moves.length;
    const message = word ? "place a piece" : "spell a word";

    return (
      <View style={[styles.row, this.props.style]}>
        <View style={[styles.equal, styles.column]}>
          <Text style={[styles.equal, styles.textCenter]}>{ score } points</Text>
          <Text style={[styles.equal, styles.textCenter]}>{ movesRemaining } moves remaining</Text>
          <Text style={[styles.equal, styles.textCenter]}>{ message }</Text>
        </View>
        <View style={styles.equal}>
          <ChallengePieceSetDisplay />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  equal: {
    flex: 1
  },
  turn: {
    minWidth: 20,
    backgroundColor: 'lightgray',
    borderWidth: 1,
    borderColor: 'black',
    display: 'flex',
    flexDirection: 'column',
  },
  score: {
    borderWidth: 2,
    borderColor: 'white',
    flex: 1,
    textAlign: 'center',
  },
  highlight: {
    backgroundColor: 'green',
  },
  textCenter: {
    textAlign: 'center',
  },
});

export default ChallengeInfoDisplay;
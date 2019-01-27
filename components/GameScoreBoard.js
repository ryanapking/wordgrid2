import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

class GameScoreBoard extends Component {
  render() {
    const { p1, p2, scoreBoard, uid, highlight } = this.props;

    const scoreBoardArray = this.convertPlayerScoresToArray(scoreBoard.p1, scoreBoard.p2);

    const topLabel = (p1 === uid) ? "You: " : "Them: ";
    const bottomLabel = (p2 === uid) ? "You: " : "Them: ";

    const totalScores = scoreBoardArray.reduce( (totals, turn) => {
      const p1 = totals.p1 + turn.p1;
      const p2 = totals.p2 + turn.p2;
      return {p1, p2};
    }, { p1: 0, p2: 0});

    // add some dummy highlight data
    let drawScoreBoard = scoreBoardArray.map( (turn) => {
      return {
        ...turn,
        p1Highlight: null,
        p2Highlight: null,
      }
    });

    // highlight the designated square, if it exists
    if (highlight) {
      const player = (p1 === highlight.player) ? "p1Highlight" : "p2Highlight";
      drawScoreBoard[highlight.inning][player] = styles.highlight;
    }

    return (
      <View style={[styles.row, this.props.style]}>
        <View style={styles.column}>
          <Text style={styles.equal}>{ topLabel }</Text>
          <Text style={styles.equal}>{ bottomLabel }</Text>
        </View>
        {drawScoreBoard.map( (turn, index) =>
          <View key={index} style={styles.turn}>
            <Text style={[styles.score, turn.p1Highlight]}>{turn.p1}</Text>
            <Text style={[styles.score, turn.p2Highlight]}>{turn.p2}</Text>
          </View>
        )}
        <View style={styles.turn}>
          <Text style={styles.score}>{ totalScores.p1 }</Text>
          <Text style={styles.score}>{ totalScores.p2 }</Text>
        </View>
      </View>
    );
  }

  convertPlayerScoresToArray(player1Scores, player2Scores) {
    const emptyMove = {p1: null, p2: null};
    let scoreBoardArray = [];

    player1Scores.forEach( (score, scoreIndex) => {
      if (scoreIndex > (scoreBoardArray.length - 1)) {
        scoreBoardArray.push({...emptyMove});
      }
      scoreBoardArray[scoreIndex].p1 = score;
    });

    player2Scores.forEach( (score, scoreIndex) => {
      if (scoreIndex > (scoreBoardArray.length - 1)) {
        scoreBoardArray.push(emptyMove);
      }
      scoreBoardArray[scoreIndex].p2 = score;
    });

    while (scoreBoardArray.length < 5) {
      scoreBoardArray.push({...emptyMove});
    }

    return scoreBoardArray;
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
  }
});

const mapStateToProps = (state) => {
  return {
    uid: state.user.uid
  };
};

export default withRouter(connect(mapStateToProps)(GameScoreBoard));
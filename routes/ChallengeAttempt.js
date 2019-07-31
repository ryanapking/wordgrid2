import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';

import Board from '../components/Board';
import ChallengeInteraction from '../components/ChallengeInteraction';
import ChallengeInfoDisplay from '../components/ChallengeInfoDisplay';
import PieceOverlay from '../components/PieceOverlay';
import {
  startChallenge,
  consumeSquare,
  removeSquare,
  clearConsumedSquares,
  placePiece,
  saveAttempt,
} from "../data/redux/challengeData";
import DrawBoard from "../components/DrawBoard";
import BoardPathCreator from "../components/BoardPathCreator";

class ChallengeAttempt extends Component {
  componentDidMount() {
    const { challenge } = this.props.challengeData;
    if (!challenge || challenge.gameOver) {
      this.props.startChallenge();
    }
  }

  componentDidUpdate() {
    const { challenge } = this.props.challengeData;

    if (challenge.gameOver && !challenge.attemptSaved) {
      this.props.saveAttempt(this.props.userID);
    }
  }

  render() {
    const { challenge } = this.props.challengeData;

    if (challenge) {

      // zindex doesn't work on android. must move the overlay before or after the other elements, depending on need.
      const pieceOverlay =
        <PieceOverlay
          pointerEvents={'none'}
          boardRows={challenge.rows}
          placePiece={(pieceIndex, rowRef, columnRef) => this.props.placePiece(pieceIndex, rowRef, columnRef)}
        />;

      return (
        <View style={styles.container}>
          { challenge.word ? null : pieceOverlay }
          <View style={styles.underlay}>
            <View style={styles.info}>
              <ChallengeInfoDisplay
                moves={challenge.moves}
                score={challenge.score}
                word={challenge.word}
                style={{height: '100%', width: '100%'}}
              />
            </View>
            <Board
              style={styles.board}
              rows={challenge.rows}
              pointerEventsDisabled={challenge.word.length > 0}
              consumedSquares={challenge.consumedSquares}
              consumeSquare={(square) => this.props.consumeSquare(square)}
              removeSquare={() => this.props.removeSquare()}
              clearConsumedSquares={() => this.props.clearConsumedSquares()}
            >
              <DrawBoard
                boardState={challenge.rows}
                boardSize={this.props.display.boardLocation.width}
                consumedSquares={challenge.consumedSquares}
                hoveredSquares={this.props.display.hoveredSpaces}
              />
              <BoardPathCreator squares={challenge.consumedSquares} boardLocation={this.props.display.boardLocation}/>
            </Board>
            <ChallengeInteraction style={styles.interaction} />
          </View>
          { challenge.word ? pieceOverlay : null }
        </View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    // display: 'flex',
    // flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  underlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 4,
  },
  board: {
    flex: 14,
  },
  interaction: {
    flex: 5,
  }
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.uid,
    challengeData: state.challengeData,
    display: state.gameDisplay,
  };
};

const mapDispatchToProps = {
  startChallenge,
  consumeSquare,
  removeSquare,
  clearConsumedSquares,
  placePiece,
  saveAttempt,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeAttempt));
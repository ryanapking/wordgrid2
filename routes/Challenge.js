import React, { Component } from 'react';
import {Text, StyleSheet, View} from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';
import { Container } from "native-base";

import Board from '../components/Board';
import ChallengeInteraction from '../components/ChallengeInteraction';
import ChallengeInfoDisplay from '../components/ChallengeInfoDisplay';
import PieceOverlay from '../components/PieceOverlay';
import { startChallenge, consumeSquare, removeSquare, clearConsumedSquares, placePiece, saveAttempt } from "../data/redux/challengeData";

class Challenge extends Component {
  componentDidMount() {
    const { challenge } = this.props.challengeData;
    if (!challenge || challenge.gameOver) {
      this.props.startChallenge();
    }
  }

  componentDidUpdate() {
    const { challenge, source } = this.props.challengeData;

    if (challenge.gameOver && !challenge.attemptSaved) {
      this.props.saveAttempt(this.props.userID);
    }
  }

  render() {
    const { challenge } = this.props.challengeData;

    if (challenge) {
      let overlayZIndex = 0;
      if (challenge.word) {
        overlayZIndex = 3;
      }
      return (
        <Container>
          <View style={[styles.underlay, {zIndex: 2}]}>
            <View style={styles.info}>
              <ChallengeInfoDisplay
                history={challenge.history}
                score={challenge.score}
                word={challenge.word}
                style={{height: '100%', width: '100%'}}
              />
            </View>
            <Board
              style={styles.board}
              word={challenge.word}
              rows={challenge.rows}
              consumedSquares={challenge.consumedSquares}
              consumeSquare={(square) => this.props.consumeSquare(square)}
              removeSquare={() => this.props.removeSquare()}
              clearConsumedSquares={() => this.props.clearConsumedSquares()}
            />
            <ChallengeInteraction style={styles.interaction}></ChallengeInteraction>
          </View>
          <PieceOverlay
            style={{zIndex: overlayZIndex}}
            pointerEvents={'none'}
            boardRows={challenge.rows}
            placePiece={(pieceIndex, rowRef, columnRef) => this.props.placePiece(pieceIndex, rowRef, columnRef)}
          />
        </Container>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column'
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
    challengeData: state.challengeData
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Challenge));
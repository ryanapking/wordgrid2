import React, { Component } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from 'react-native-elements';

import { getAttemptByChallengeIDAndIndex } from "../data/async-storage/challengeAttempts";
import { getAttemptByID, getChallengeByID } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";
import { challengeAttemptToReviewObject } from "../data/utilities/functions/dataConversions";
import { SPACE_STATES } from "../data/utilities/constants";

import BoardDrawLetterGrid from '../components/presentation/BoardDrawLetterGrid';
import BoardPathCreator from '../components/presentation/BoardPathCreator';
import Piece from '../components/containers/PieceDraggableView';

class ChallengeAttemptReview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      challenge: null,
      attempt: null,

      reviewObject: null,

      moveIndex: 0,
      phaseIndex: null,
      boardLocation: {},
    };
  }

  componentDidMount() {
    const { attemptID } = this.props;
    if (attemptID) {
      this._getAttemptDataByAttemptIndex().then();
    } else {
      this._getAttemptFromLocalStorage().then();
    }
  }

  async _getAttemptDataByAttemptIndex() {
    const attempt = await getAttemptByID(this.props.attemptID)
      .catch((err) => {
        console.log('error getting attempt', err);
        this.props.setErrorMessage("unable to get challenge attempt info");
      });

    const reviewObject = challengeAttemptToReviewObject(attempt.challenge, attempt);

    this.setState({
      reviewObject,
      challenge: attempt.challenge,
      attempt: attempt,
    });
  }

  async _getAttemptFromLocalStorage() {
    const { userID, challengeID, attemptIndex } = this.props;
    let attempt, challenge;

    const attemptPromise = getAttemptByChallengeIDAndIndex(userID, challengeID, attemptIndex)
      .then((value) => {
        attempt = value;
      })
      .catch((err) => {
        console.log('error getting attempt', err);
      });

    const challengePromise = getChallengeByID(challengeID)
      .then((value) => {
        challenge = value;
      })
      .catch((err) => {
        console.log('error fetching challenge by id', err);
      });

    await Promise.all([attemptPromise, challengePromise]);

    if (attempt && challenge) {
      const reviewObject = challengeAttemptToReviewObject(challenge, attempt);
      this.setState({ reviewObject, challenge, attempt });
    } else {
      this.props.setErrorMessage('unable to get attempt');
    }

  }

  render() {
    const { attempt, reviewObject, boardLocation, moveIndex, phaseIndex } = this.state;

    if (!reviewObject || !boardLocation) return null;

    console.log('challenge object:', this.state.challenge);
    console.log('attempt:', attempt);
    console.log('review object:', reviewObject);

    const reviewing = reviewObject[moveIndex];

    let boardState = reviewing.initialState.boardState;
    let highlightPath = [];
    let wordPath = [];

    if (phaseIndex === 0) {
      wordPath = reviewing.wordPath;
      highlightPath = reviewing.wordPath;
    } else if (phaseIndex === 1) {
      boardState = reviewing.thirdState.boardState;
      highlightPath = reviewing.pieceBoardSquares;
    }

    console.log('highlighting:', highlightPath);

    const displayBoardState = boardState.map( (row, rowIndex) => {
      return row.map( (letter, columnIndex) => {
        if (!letter) {
          return {letter, status: SPACE_STATES.SPACE_EMPTY};
        } else if (!this._checkSquareAvailable({rowIndex, columnIndex}, highlightPath)) {
          return {letter, status: SPACE_STATES.SPACE_CONSUMED};
        } else {
          return {letter, status: SPACE_STATES.SPACE_FILLED};
        }
      });
    });

    const pieceSize = boardLocation ? boardLocation.width * .12 : null;

    return (
      <View style={styles.reviewContainer}>

        <View style={styles.boardSection}>
          <View style={styles.board} ref={gameBoard => this.gameBoard = gameBoard} onLayout={() => this._onLayout()}>
            <BoardDrawLetterGrid boardState={displayBoardState} boardSize={boardLocation.width}/>
            <BoardPathCreator squares={wordPath} boardLocation={boardLocation}/>
          </View>
        </View>

        <View style={styles.movesSection}>
          <ScrollView>
            <ListItem title="Moves" containerStyle={styles.divider} />
            {reviewObject.map( (move, index) =>
              <View key={index}>
                <TouchableWithoutFeedback onPressIn={() => this.setState({ moveIndex: index, phaseIndex: 0 })} >
                  <ListItem
                    containerStyle={(this.state.moveIndex === index && this.state.phaseIndex === 0) ? {backgroundColor: 'lightcoral'} : {}}
                    title={ move.word.toUpperCase() }
                    rightTitle={ move.wordValue + " points"}
                  />
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPressIn={() => this.setState({ moveIndex: index, phaseIndex: 1 })} >
                  <ListItem
                    containerStyle={(this.state.moveIndex === index && this.state.phaseIndex === 1) ? {backgroundColor: 'lightcoral'} : {}}
                    title={
                      <View style={styles.gamePieceContainer}>
                        <Piece piece={move.piece} style={styles.gamePiece} pieceIndex={move.placementRef.pieceIndex} baseSize={pieceSize} allowDrag={false}/>
                      </View>
                    }
                    rightTitle={ move.placementValue + " points"}
                  />
                </TouchableWithoutFeedback>
              </View>
            )}
          </ScrollView>
        </View>

      </View>
    );
  }

  _checkSquareAvailable(square, wordPath) {
    return wordPath.reduce( (squareAvailable, pathSquare) => {
      if (square.rowIndex === pathSquare.rowIndex && square.columnIndex === pathSquare.columnIndex) {
        return false;
      } else {
        return squareAvailable;
      }
    }, true);
  }

  _onLayout() {
    this.gameBoard.measure((x, y, width, height) => {
      this.setState({
        boardLocation: {
          x,
          y,
          width,
          height,
          rowHeight: height / 10,
          columnWidth: width / 10,
        }
      });
    });
  }
}

const styles = StyleSheet.create({
  reviewContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  boardSection: {
    display: 'flex',
    alignItems: 'center',
    flex: 3,
  },
  movesSection: {
    flex: 2,
  },
  board: {
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  },
  spaceBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 0,
    paddingLeft: 15,
  },
  gamePieceContainer: {
    // flex: 1,
    // margin: 2,
    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'center',
    // maxHeight: '100%',
    // maxWidth: '100%',
    width: '20%',
    aspectRatio: 1,
  },
  gamePiece: {
    backgroundColor: 'gray',
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  },
  divider: {
    backgroundColor: 'lightgray',
  }
});

const mapStateToProps = (state, ownProps) => {
  const { attemptID, challengeID, attemptIndex } = ownProps.match.params;
  return {
    attemptID,
    challengeID,
    attemptIndex,
    userID: state.user.uid,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeAttemptReview));
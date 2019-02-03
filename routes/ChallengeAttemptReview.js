import React, { Component } from 'react';
import {View, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { List, ListItem } from "native-base";

import { getChallengeAttemptByDateAndIndex } from "../data/async-storage";
import DrawBoard from '../components/DrawBoard';
import BoardPathCreator from '../components/BoardPathCreator';
import { boardStringToArray, wordPathStringToArray } from "../data/utilities";
import { SPACE_CONSUMED, SPACE_EMPTY, SPACE_FILLED } from "../constants";

class ChallengeAttemptReview extends Component {
  constructor() {
    super();

    this.state = {
      challenge: null,
      attempt: null,

      moveIndex: 1,
      displayPath: [],
      boardLocation: {},
    };
  }

  componentDidMount() {
    getChallengeAttemptByDateAndIndex(this.props.userID, this.props.challengeDate, this.props.attemptIndex)
      .then( (attemptObject) => {
        console.log('found attempt:', attemptObject);
        this.setState({
          challenge: attemptObject.challenge,
          attempt: attemptObject.attempt,
        })
      });
  }

  render() {
    console.log('state:', this.state);

    return <Text>ChallengeAttemptReview.js</Text>;

    const { attempt } = this.props;
    const { boardLocation, moveIndex } = this.state;

    console.log('attempt:', attempt);

    const move = attempt.history[moveIndex];
    const boardString = attempt.history[moveIndex-1].b;
    const boardState = boardStringToArray(boardString);

    const displayPath = wordPathStringToArray(move.wp);

    const displayBoardState = boardState.map( (row, rowIndex) => {
      return row.map( (letter, columnIndex) => {
        if (!letter) {
          return {letter, status: SPACE_EMPTY};
        } else if (!this._checkSquareAvailable({rowIndex, columnIndex}, displayPath)) {
          return {letter, status: SPACE_CONSUMED};
        } else {
          return {letter, status: SPACE_FILLED};
        }
      });
    });

    return (
      <View style={styles.reviewContainer}>

        <View style={styles.boardSection}>
          <View style={styles.board} ref={gameBoard => this.gameBoard = gameBoard} onLayout={() => this._onLayout()}>
            <DrawBoard boardState={displayBoardState} boardSize={boardLocation.width}/>
            <BoardPathCreator squares={displayPath} boardLocation={boardLocation}/>
          </View>
        </View>

        <View style={styles.movesSection}>
          <List>
            <ListItem itemDivider style={styles.spaceBetween}>
              <Text>Moves</Text>
            </ListItem>
            {attempt.history.slice(1).map( (move, index) =>
              <TouchableWithoutFeedback key={index} onPressIn={() => this.setState({moveIndex: index+1})} >
                <ListItem style={styles.spaceBetween}>
                  <View>
                    <Text>{ move.w.toUpperCase() }</Text>
                  </View>
                  <View>
                    <Text>{ move.wv }</Text>
                  </View>
                </ListItem>
              </TouchableWithoutFeedback>
            )}
          </List>
        </View>

      </View>
    );
  }

  _checkSquareAvailable(square, displayPath) {
    return displayPath.reduce( (squareAvailable, pathSquare) => {
      if (square.rowIndex === pathSquare.rowIndex && square.columnIndex === pathSquare.columnIndex) {
        return false;
      } else {
        return squareAvailable;
      }
    }, true);
  }

  _onLayout() {
    this.gameBoard.measure((x, y, width, height, pageX, pageY) => {
      // console.log('measure:', {x, y, width, height, pageX, pageY});
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
  },
});

const mapStateToProps = (state, ownProps) => {
  const { challengeDate, attemptIndex } = ownProps.match.params;
  return {
    challengeDate,
    attemptIndex,
    userID: state.user.uid,
  };
};

export default withRouter(connect(mapStateToProps)(ChallengeAttemptReview));
import React, { Component } from 'react';
import {View, StyleSheet, Text, TouchableWithoutFeedback, ScrollView} from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { List, ListItem } from "native-base";

import { getChallengeAttemptByDateAndIndex } from "../data/async-storage";
import DrawBoard from '../components/DrawBoard';
import BoardPathCreator from '../components/BoardPathCreator';
import Piece from '../components/Piece';
import { boardStringToArray, wordPathStringToArray, challengeAttemptToReviewObject } from "../data/utilities";
import { SPACE_CONSUMED, SPACE_EMPTY, SPACE_FILLED } from "../constants";

class ChallengeAttemptReview extends Component {
  constructor() {
    super();

    this.state = {
      challenge: null,
      attempt: null,

      reviewObject: null,

      moveIndex: 0,
      phaseIndex: null,
      displayPath: [],
      boardLocation: {},
    };
  }

  componentDidMount() {
    this._getAttemptData();
  }

  _getAttemptData() {
    getChallengeAttemptByDateAndIndex(this.props.userID, this.props.challengeDate, this.props.attemptIndex)
      .then( (attemptObject) => {
        console.log('found attempt:', attemptObject);

        const reviewObject = challengeAttemptToReviewObject(attemptObject.challenge, attemptObject.attempt);

        this.setState({
          reviewObject,
          challenge: attemptObject.challenge,
          attempt: attemptObject.attempt,
        });
      });
  }

  render() {
    const { attempt, reviewObject, boardLocation, moveIndex } = this.state;

    if (!reviewObject || !boardLocation) return null;

    console.log('challenge object:', this.state.challenge);
    console.log('attempt:', attempt);
    console.log('review object:', reviewObject);

    const reviewing = reviewObject[moveIndex];
    const boardState = reviewing.initialState.boardState;
    const displayPath = reviewing.wordPath;

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
          <ScrollView ref={(scrollView) => this._availableMoves = scrollView}>
            <List>
              <ListItem itemDivider style={styles.spaceBetween}>
                <Text>Moves</Text>
              </ListItem>
              {reviewObject.map( (move, index) =>
                <View key={index}>
                  <TouchableWithoutFeedback onPressIn={() => this.setState({ moveIndex: index, phaseIndex: 0 })} >
                    <ListItem style={styles.spaceBetween}>
                      <Text>{ move.word.toUpperCase() }</Text>
                      <Text>{ move.wordValue } points</Text>
                    </ListItem>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPressIn={() => this.setState({ moveIndex: index, phaseIndex: 1 })} >
                    <ListItem style={styles.spaceBetween}>
                      <View style={styles.gamePieceContainer}>
                        <Piece piece={move.piece} style={styles.gamePiece} pieceIndex={move.placementRef.pieceIndex} allowDrag={false}/>
                      </View>
                      <Text>{ move.placementValue} points</Text>
                    </ListItem>
                  </TouchableWithoutFeedback>
                </View>
              )}
            </List>
          </ScrollView>
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
  }
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
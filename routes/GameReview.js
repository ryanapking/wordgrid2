import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { List, ListItem } from 'native-base';

import { moveRemoteToLocal, remoteToStartingGameState, applyMove, arrayToString, calculateLongestWordLength, calculateHighestWordValue, getWordPath } from "../data/utilities";
import Boggle from '../data/utilities/boggle-solver';

import DrawBoard from '../components/DrawBoard';
import BoardPathCreator from "../components/BoardPathCreator";
import DrawScoreBoard from "../components/GameScoreBoard";
import { SPACE_CONSUMED, SPACE_EMPTY, SPACE_FILLED } from "../constants";
import { wordPathStringToArray, calculateWordValue } from "../data/utilities";

class GameReview extends Component {
  constructor() {
    super();

    this.state = {
      // current move info being reviewed
      moveIndex: 1,

      startingGameState: null,
      displayingGameState: null,

      // the pieces of the list view
      playerMovePath: [],
      playerMoveWord: null,

      mostValuableWords: [],
      mostValuablePoints: null,

      longestWords: [],
      longestLetterCount: null,

      availableWords: [],

      // the only thing that's actually drawn on the board
      displayPath: [],

      // measurements
      boardLocation: {},
    };
  }

  componentDidMount() {
    const startingGameState = remoteToStartingGameState(this.props.game.sourceData);
    this.setState({
      startingGameState: startingGameState,
    });
    this._getReviewResults(this.state.moveIndex, startingGameState);
  }

  render() {
    if (!this.state.displayingGameState) return null;
    const { moveIndex, boardLocation, displayingGameState } = this.state;
    const { game } = this.props;
    const move = game.moves[moveIndex];
    const boardState = displayingGameState.boardState;
    const moveInning = Math.floor((moveIndex) / 2);
    const moveLabel = (move.p === this.props.uid) ? "Your move:" : "Their move:";

    const displayBoardState = boardState.map( (row, rowIndex) => {
      return row.map( (letter, columnIndex) => {
        if (!letter) {
          return {letter, status: SPACE_EMPTY};
        } else if (!this._checkSquareAvailable({rowIndex, columnIndex})) {
          return {letter, status: SPACE_CONSUMED};
        } else {
          return {letter, status: SPACE_FILLED};
        }
      });
    });

    const hideNextButton = (moveIndex >= game.moves.length - 1);
    const hidePrevButton = (moveIndex <= 0);

    return (
      <View style={styles.reviewContainer}>

        <View style={styles.boardSection}>
          <View style={styles.board} ref={gameBoard => this.gameBoard = gameBoard} onLayout={() => this._onLayout()}>
            <DrawBoard boardState={displayBoardState} boardSize={boardLocation.width}/>
            <BoardPathCreator squares={this.state.displayPath} boardLocation={boardLocation}/>
          </View>
        </View>

        <View style={styles.changeMovesSection}>
          <View>
            { hidePrevButton ? null :
              <Text style={styles.changeMove} onPress={() => this._changeMoveIndex(moveIndex - 1)}>Prev</Text>
            }
          </View>
          <View>
            { hideNextButton ? null :
              <Text style={styles.changeMove} onPress={() => this._changeMoveIndex(moveIndex + 1)}>Next</Text>
            }
          </View>
        </View>

        <View style={styles.availableMovesSection}>
          <ScrollView ref={(scrollView) => this._availableMoves = scrollView}>
            <List>

              <ListItem itemDivider style={styles.spaceBetween}>
                <Text>{ moveLabel }</Text>
                <Text>{ move.wv } points</Text>
              </ListItem>
              <TouchableWithoutFeedback onPressIn={() => this._setDisplayPath(this.state.playerMovePath)} onPressOut={() => this._clearDisplayPath()}>
                <ListItem style={styles.spaceBetween}>
                  <View>
                    <Text>{ move.w.toUpperCase() }</Text>
                  </View>
                  <View>
                    <DrawScoreBoard p1={game.p1} p2={game.p2} currentPlayerScoreBoard={game.currentPlayer.scoreBoard} opponentScoreBoard={game.opponent.scoreBoard} highlight={{player: move.p, inning: moveInning}}/>
                  </View>
                </ListItem>
              </TouchableWithoutFeedback>

              <ListItem itemDivider style={styles.spaceBetween}>
                <Text>Most Valuable Words:</Text>
                <Text>{ this.state.mostValuablePoints } points</Text>
              </ListItem>
              {this.state.mostValuableWords.map( (word, index) =>
                <TouchableWithoutFeedback key={index} onPressIn={() => this._findAndSetDisplayPath(word, boardState)} onPressOut={() => this._clearDisplayPath()}>
                  <ListItem>
                    <Text>{word}</Text>
                  </ListItem>
                </TouchableWithoutFeedback>
              )}

              <ListItem itemDivider style={styles.spaceBetween}>
                <Text>Longest Words:</Text>
                <Text>{ this.state.longestLetterCount } letters</Text>
              </ListItem>
              {this.state.longestWords.map( (word, index) =>
                <TouchableWithoutFeedback key={index} onPressIn={() => this._findAndSetDisplayPath(word, boardState)} onPressOut={() => this._clearDisplayPath()}>
                  <ListItem>
                    <Text>{word}</Text>
                  </ListItem>
                </TouchableWithoutFeedback>
              )}

              <ListItem itemDivider style={styles.spaceBetween}>
                <Text>All Available Words:</Text>
                <Text>{ this.state.availableWords.length } words</Text>
              </ListItem>
              {this.state.availableWords.map( (word, index) =>
                <TouchableWithoutFeedback key={index} onPressIn={() => this._findAndSetDisplayPath(word.word, boardState)} onPressOut={() => this._clearDisplayPath()}>
                  <ListItem style={styles.spaceBetween}>
                    <Text>{ word.word }</Text>
                    <Text>{ word.value } points</Text>
                  </ListItem>
                </TouchableWithoutFeedback>
              )}

            </List>
          </ScrollView>
        </View>

      </View>
    );
  }

  _changeMoveIndex(moveIndex) {
    this.setState({
      moveIndex,
    });

    this._availableMoves.scrollTo({y: 0, animated: false});
    this._availableMoves.flashScrollIndicators();
    this._getReviewResults(moveIndex, this.state.startingGameState);
  }

  _clearDisplayPath() {
    this.setState({
      displayPath: []
    });
  }

  _setDisplayPath(wordPath) {
    this.setState({
      displayPath: wordPath
    });
  }

  _findAndSetDisplayPath(word, boardState) {
    const wordPath = getWordPath(word, boardState);
    this._setDisplayPath(wordPath);
  }

  _checkSquareAvailable(square) {
    return this.state.displayPath.reduce( (squareAvailable, pathSquare) => {
      if (square.rowIndex === pathSquare.rowIndex && square.columnIndex === pathSquare.columnIndex) {
        return false;
      } else {
        return squareAvailable;
      }
    }, true);
  }

  _getReviewResults(moveIndex, startingGameState) {
    const { game } = this.props;
    const { moves } = game;

    let currentGameState = startingGameState;
    for (let i = 0; i < moveIndex; i++) {
      currentGameState = applyMove(currentGameState, moveRemoteToLocal(moves[i]));
    }

    const move = moveRemoteToLocal(moves[moveIndex]);

    const boardString = arrayToString(currentGameState.boardState);

    let boggle = new Boggle(boardString);
    boggle.solve( (words) => {
      const longest = calculateLongestWordLength(words);
      const mostValuable = calculateHighestWordValue(words);

      const allWordsWithValues = words
        .slice()
        .sort()
        .map( (word) => {
          const value = calculateWordValue(word);
          return {word, value};
        })
        .sort( (word1, word2) => {
          return word2.value - word1.value;
        });

      this.setState({
        displayingGameState: currentGameState,
        availableWords: allWordsWithValues,
        longestWords: longest.words,
        longestLetterCount: longest.length,
        mostValuableWords: mostValuable.words,
        mostValuablePoints: mostValuable.value,
        playerMovePath: move.wordPath,
      });
    });
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
    flex: 42,
  },
  changeMovesSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 8,
  },
  availableMovesSection: {
    flex: 50,
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
  changeMove: {
    padding: 10
  },
  playerMove: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    gameID: gameID,
    game: state.gameData.byID[gameID],
    uid: state.user.uid
  };
};

export default withRouter(connect(mapStateToProps)(GameReview));
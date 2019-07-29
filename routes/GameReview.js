import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from 'react-native-elements';

import {
  remoteToLocal,
  moveRemoteToLocal,
  remoteToStartingGameState,
  arrayToString,
} from "../data/utilities/functions/dataConversions";
import {
  calculateLongestWordLength,
  calculateHighestWordValue,
  calculateWordValue,
} from '../data/utilities/functions/calculations';
import { applyMove, } from '../data/utilities/functions/applyMoves';
import { getWordPath } from '../data/utilities/functions/getters';
import { getGameSourceData } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";
import { SPACE_STATES } from "../data/utilities/constants";
import Boggle from '../data/boggle-solver';

import DrawBoard from '../components/DrawBoard';
import BoardPathCreator from "../components/BoardPathCreator";
import DrawScoreBoard from "../components/GameScoreBoard";

class GameReview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      game: {},

      // current move info being reviewed
      moveIndex: 0,

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

  async componentDidMount() {
    const { gameFromRedux, gameID, uid } = this.props;

    // if this is a recent game, our source data should be coming from redux and we already have it
    let gameSourceData = gameFromRedux ? gameFromRedux.sourceData : null;

    // if the data didn't come from redux, pull it from Parse
    if (!gameSourceData) {
      gameSourceData = await getGameSourceData(gameID)
        .catch(() => {
          // we sort this error below
        });
    }

    // start the game review process or redirect to previous page
    if (gameSourceData) {
      const game = remoteToLocal(gameSourceData, uid);
      const startingGameState = remoteToStartingGameState(gameSourceData);
      await this.setState({game, startingGameState});
      this._getReviewResults(this.state.moveIndex, startingGameState);
    } else {
      this.props.setErrorMessage("Error getting game data.");
      this.props.history.goBack();
    }
  }

  render() {
    if (!this.state.displayingGameState) return null;
    const { moveIndex, boardLocation, displayingGameState, game } = this.state;
    const move = game.moves[moveIndex];
    const boardState = displayingGameState.boardState;
    const moveInning = Math.floor((moveIndex) / 2);
    const moveLabel = (move.p === this.props.uid) ? "Your move:" : "Their move:";

    const displayBoardState = boardState.map( (row, rowIndex) => {
      return row.map( (letter, columnIndex) => {
        if (!letter) {
          return {letter, status: SPACE_STATES.SPACE_EMPTY};
        } else if (!this._checkSquareAvailable({rowIndex, columnIndex})) {
          return {letter, status: SPACE_STATES.SPACE_CONSUMED};
        } else {
          return {letter, status: SPACE_STATES.SPACE_FILLED};
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

            <ListItem
              title={ moveLabel }
              rightTitle={ move.wv + " points" }
              containerStyle={styles.divider}
            />
            <TouchableWithoutFeedback onPressIn={() => this._setDisplayPath(this.state.playerMovePath)} onPressOut={() => this._clearDisplayPath()}>
              <ListItem
                title={ move.w.toUpperCase() }
                rightTitle={
                  <DrawScoreBoard p1={game.p1} p2={game.p2} currentPlayerScoreBoard={game.currentPlayer.scoreBoard} opponentScoreBoard={game.opponent.scoreBoard} highlight={{player: move.p, inning: moveInning}}/>
                }
              />
            </TouchableWithoutFeedback>

            <ListItem
              title="Most Valuable Words"
              rightTitle={ this.state.mostValuablePoints + " points" }
              containerStyle={styles.divider}
            />
            {this.state.mostValuableWords.map( (word, index) =>
              <TouchableWithoutFeedback key={index} onPressIn={() => this._findAndSetDisplayPath(word, boardState)} onPressOut={() => this._clearDisplayPath()}>
                <ListItem title={ word } />
              </TouchableWithoutFeedback>
            )}

            <ListItem
              title="Longest Words"
              rightTitle={ this.state.longestLetterCount + " letters"}
              containerStyle={styles.divider}
            />
            {this.state.longestWords.map( (word, index) =>
              <TouchableWithoutFeedback key={index} onPressIn={() => this._findAndSetDisplayPath(word, boardState)} onPressOut={() => this._clearDisplayPath()}>
                <ListItem title={word} />
              </TouchableWithoutFeedback>
            )}

            <ListItem
              title="All Available Words"
              rightTitle={ this.state.availableWords.length + " words" }
              containerStyle={styles.divider}
            />
            {this.state.availableWords.map( (word, index) =>
              <TouchableWithoutFeedback key={index} onPressIn={() => this._findAndSetDisplayPath(word.word, boardState)} onPressOut={() => this._clearDisplayPath()}>
                <ListItem title={word.word} rightTitle={ word.value + " points" } />
              </TouchableWithoutFeedback>
            )}

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
    const { game } = this.state;
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
  divider: {
    backgroundColor: 'lightgray',
  }
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  // if this is an archived game, it will not be in the redux data. We will deal with this case in componentDidMount().
  const gameFromRedux = state.gameData.byID[gameID];
  return {
    gameID: gameID,
    gameFromRedux,
    uid: state.user.uid
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameReview));
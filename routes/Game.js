import React, { Component } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import Boggle from '../data/boggle-solver';
import BoardTouchView from '../components/BoardTouchView';
import GameMoveAnimation from '../components/GameMoveAnimation';
import PieceOverlay from '../components/PieceOverlay';
import {
  setAvailableWordsData,
  consumeSquare,
  removeSquare,
  clearConsumedSquares,
  placePiece,
  resetLocalGameDataByID,
  playWord,
} from "../data/redux/gameData";
import {
  calculateHighestWordValue,
  calculateLongestWordLength,
} from "../data/utilities/functions/calculations";
import { checkPieceFit } from "../data/utilities/functions/checks";

import SpellWordSection from "../components/SpellWordSection";
import BoardDrawLetterGrid from "../components/BoardDrawLetterGrid";
import BoardPathCreator from "../components/BoardPathCreator";
import DrawPieceSection from "../components/DrawPieceSection";
import GameScoreBoard from "../components/GameScoreBoard";
import GamePhaseDisplay from "../components/GamePhaseDisplay";

class Game extends Component {

  componentDidMount() {
    // console.log('game.js component mounted');
    // console.log('game:', this.props.game);

    // checkPieceFit(this.props.game.me, this.props.game.rows);
    // gameOverCheck(this.props.game);

    // log all the moves to see how we did
    // this.props.game.history.forEach( (state) => {
    //   console.log('played:', state.w);
    //   let boggle = new Boggle(state.b);
    //   boggle.solve( (words) => {
    //     boggle.print();
    //
    //     calculateHighPointWord(words);
    //     calculateLongestWord(words);
    //
    //     console.log(words.length + ' words');
    //     console.log(words.join(', '));
    //   });
    // });

    // will need to be fixed later. removing history reference.
    const currentBoardString = this.props.game.sourceData.startingBoard;
    let boggle = new Boggle(currentBoardString);

    boggle.solve( (words) => {
      const longest = calculateLongestWordLength(words).length;
      const mostValuable = calculateHighestWordValue(words).value;

      this.props.setAvailableWordsData(this.props.gameID, longest, mostValuable, words.length);
    });

  }

  render() {
    const { game, gameID, uid } = this.props;

    // zindex doesn't work on android, so we need to move the overlay before or after the other visual elements
    const overlayActive = (game.word && !game.piecePlaced);

    const pieceOverlay = (
      <PieceOverlay
        pointerEvents={'none'}
        boardRows={game.rows}
        placePiece={(pieceIndex, rowRef, columnRef) => this.props.placePiece(this.props.gameID, pieceIndex, rowRef, columnRef)}
      />
    );

    if (!this.props.game.animationOver) {
      return (
        <View style={styles.container}>
          <GameMoveAnimation game={game} gameID={gameID} />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          { overlayActive ? null : pieceOverlay }
          <View style={styles.underlay}>
            <View style={styles.info}>
              <View style={[styles.leftSide, {padding: 5}]}>
                <Text>Opponent Pieces:</Text>
                <DrawPieceSection pieces={game.opponent.currentPieces} allowDrag={false} />
              </View>
              <View style={[styles.rightSide, {padding: 5}]}>
                <GameScoreBoard
                  style={styles.equal}
                  uid={uid}
                  p1={game.p1}
                  p2={game.p2}
                  currentPlayerScoreBoard={game.currentPlayer.scoreBoard}
                  opponentScoreBoard={game.opponent.scoreBoard}
                />
                <GamePhaseDisplay style={styles.equal} movePhase={game.movePhase} />
              </View>
            </View>
            <BoardTouchView
              style={styles.board}
              rows={game.rows}
              pointerEventsDisabled={game.word.length > 0}
              consumedSquares={game.consumedSquares}
              consumeSquare={(square) => this.props.consumeSquare(square, gameID)}
              removeSquare={() => this.props.removeSquare(gameID)}
              clearConsumedSquares={() => this.props.clearConsumedSquares(gameID)}
            >
              <BoardDrawLetterGrid
                boardState={game.rows}
                boardSize={this.props.display.boardLocation.width}
                consumedSquares={game.consumedSquares}
                hoveredSquares={this.props.display.hoveredSpaces}
              />
              <BoardPathCreator
                squares={game.consumedSquares}
                boardLocation={this.props.display.boardLocation}
              />
            </BoardTouchView>
            <View style={styles.interaction}>
              { game.movePhase === "place" ?
                <DrawPieceSection pieces={game.currentPlayer.currentPieces} allowDrag />
                : null
              }
              { game.movePhase === "confirm" ?
                <View style={styles.confirmMoveSection}>
                  <Button title="Submit Move" onPress={ () => this.props.saveMove(gameID, uid) } />
                  <Button title="Reset Move" onPress={ () => this.props.resetLocalGameDataByID(gameID, uid) } />
                </View>
                : null
              }
              { game.movePhase === "spell" ?
                <SpellWordSection
                  playWord={ () => this.props.playWord(gameID) }
                  clearConsumedSquares={ () => this.props.clearConsumedSquares(gameID) }
                  displayPieces={game.currentPlayer.currentPieces}
                  consumedSquares={game.consumedSquares}
                />
                : null
              }
            </View>
          </View>
          { overlayActive ? pieceOverlay : null }
        </View>
      );
    }

  }

  componentDidUpdate() {
    if ( this.props.uid !== this.props.game.turn ) {
      this.props.history.push(`/games`);
      console.log("opponent's move. redirecting...");
    }
  }

}

const styles = StyleSheet.create({
  container: {
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
    display: 'flex',
    flexDirection: 'row',
  },
  board: {
    flex: 14,
  },
  interaction: {
    flex: 5,
  },
  confirmMoveSection: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  equal: {
    flex: 1,
  },
  row: {
    flex: 1,
  },
  leftSide: {
    flex: 1,
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scoreBoard: {
    flex: 1,
  },
  phaseDisplay: {
    flex: 1,
  },
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    gameID: gameID,
    game: state.gameData.byID[gameID],
    uid: state.user.uid,
    display: state.gameDisplay,
  };
};

const mapDispatchToProps = {
  setAvailableWordsData,
  consumeSquare,
  removeSquare,
  clearConsumedSquares,
  placePiece,
  resetLocalGameDataByID,
  playWord,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Game));
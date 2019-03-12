import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import Boggle from '../data/boggle-solver';
import GameInfoDisplay from '../components/GameInfoDisplay';
import Board from '../components/Board';
import GameInteraction from '../components/GameInteraction';
import GameMoveAnimation from '../components/GameMoveAnimation';
import PieceOverlay from '../components/PieceOverlay';
import { setAvailableWordsData, consumeSquare, removeSquare, clearConsumedSquares, placePiece } from "../data/redux/gameData";
import { calculateHighestWordValue, calculateLongestWordLength } from "../data/utilities";

import { checkPieceFit } from "../data/utilities";
import DrawPieceSection from "../components/DrawPieceSection";

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
    const { game, gameID } = this.props;

    let overlayZIndex = 0;
    if (game.word && !game.piecePlaced) {
      overlayZIndex = 3;
    }

    if (!this.props.game.animationOver) {
      return (
        <View style={styles.container}>
          <GameMoveAnimation />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <View style={[styles.underlay, {zIndex: 2}]}>
            <GameInfoDisplay style={styles.info} gameID={this.props.gameID}/>
            <Board
              style={styles.board}
              word={game.word}
              rows={game.rows}
              consumedSquares={game.consumedSquares}
              consumeSquare={(square) => this.props.consumeSquare(square, gameID)}
              removeSquare={() => this.props.removeSquare(gameID)}
              clearConsumedSquares={() => this.props.clearConsumedSquares(gameID)}
            />
            <GameInteraction style={styles.interaction} gameID={this.props.gameID}/>
          </View>
          <PieceOverlay
            style={{zIndex: overlayZIndex}}
            pointerEvents={'none'}
            boardRows={game.rows}
            placePiece={(pieceIndex, rowRef, columnRef) => this.props.placePiece(this.props.gameID, pieceIndex, rowRef, columnRef)}
          />
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
    // display: 'flex',
    // flexDirection: 'column'
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
    // backgroundColor: 'blue',
  },
  board: {
    flex: 14,
    // backgroundColor: 'red',
  },
  interaction: {
    flex: 5,
    // backgroundColor: 'green',
  }
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    gameID: gameID,
    game: state.gameData.byID[gameID],
    uid: state.user.uid
  };
};

const mapDispatchToProps = {
  setAvailableWordsData,
  consumeSquare,
  removeSquare,
  clearConsumedSquares,
  placePiece,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Game));
import React, { Component } from 'react';
import ReactNative, {Platform, StyleSheet, View, Text, LayoutAnimation, UIManager, Animated} from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { markAnimationPlayed } from "../data/redux/gameData";
import { getAnimationData } from "../data/utilities";
import { SPACE_EMPTY, SPACE_FILLED, SPACE_CONSUMED } from "../constants";
import Piece from "./Piece";
import BoardPathCreator from "./BoardPathCreator";
import DrawBoard from './DrawBoard';

class GameMoveAnimation extends Component {
  constructor() {
    super();

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this.state = {
      // data concerning what is moving where
      animation: null,

      // animation values
      displayWordPath: [],
      boardState: [],
      message: "",

      // animation phase progress
      animationPhase: 'waiting to start',

      // for calculating animation values
      boardLocation: null,
      pieceStartingLocation: null,
      letterWidth: null,
      boardSize: 0, // width and height will match

      // location for the piece that will move, and then location after move
      overlay: {
        location: null,
        pieceIndex: null,
        styles: null,
        pieceSize: 0,
      },
      moveTo: {},
    };

    this.pieceRefs = {};

    this._animate();

  }

  componentDidMount() {
    const animation = getAnimationData(this.props.game);
    this.setState({
      animation: animation,
      boardState: animation.boardStates.start,
    });
  }

  render() {

    const { animation, letterWidth, displayWordPath, boardState, boardSize, message, overlay } = this.state;
    if (!animation) return null;

    const pieces = animation.pieceStates.start.map( (letters, index) => {
      if (index === animation.placementRef.pieceIndex) {
        let onLayout = () => this._measurePiece(index);
        return {letters, animationStyles: null, onLayout};
      } else {
        return {letters, animationStyles: null, onLayout: null}
      }
    });

    const boardLocation = {
      rowHeight: letterWidth,
      columnWidth: letterWidth,
    };

    const displayBoardState = boardState.map( (row, rowIndex) => {
      return row.map( (letter, columnIndex) => {
        if (!letter) {
          return {letter, status: SPACE_EMPTY};
        } else if (this._checkSpaceConsumed(displayWordPath, rowIndex, columnIndex)) {
          return {letter, status: SPACE_CONSUMED};
        } else {
          return {letter, status: SPACE_FILLED};
        }
      });
    });

    const displayWord = animation.word.substring(0, displayWordPath.length);

    return (
      <View style={styles.animationContainer} ref={(container) => this._animationContainer = container}>

        <View style={styles.gamePiecesSection}>
          <View style={styles.gamePiecesContainer}>
            { pieces.map( (piece, index) =>
              <View key={index} style={[styles.gamePieceContainer, {zIndex: 1}]} >
                <View style={[styles.gamePiece, styles.gamePieceBackground]} ref={(piece) => this.pieceRefs[index] = piece} onLayout={piece.onLayout}>
                  { (overlay.pieceIndex === index) ? null : <Piece piece={piece.letters} pieceIndex={index} style={[styles.gamePiece]} allowDrag={false} baseSize={overlay.pieceSize}/> }
                </View>
              </View>
            )}
          </View>
        </View>

        { !overlay.location ? null : <Piece piece={pieces[overlay.pieceIndex].letters} style={[styles.gamePiece, overlay.styles, this.state.moveTo]} allowDrag={false} baseSize={overlay.pieceSize}/> }

        <View style={styles.boardSection}>
          <View style={styles.board} ref={(view) => this._board = view} onLayout={() => this._measureBoard()}>
            <DrawBoard boardState={displayBoardState} boardSize={boardSize}/>
            <BoardPathCreator squares={displayWordPath} boardLocation={boardLocation}/>
          </View>
        </View>

        <View style={styles.moveInfoSection}>
          <Text style={{textAlign: 'center'}}>{ displayWord }</Text>
          <Text style={{textAlign: 'center'}}>{ message }</Text>
        </View>

      </View>
    );
  }

  _animate() {

    let interval = setInterval( () => {
      // make sure all the needed data exists before starting the animation
      if (!this.state.animation || !this.state.boardLocation || !this.state.overlay.location) {
        return;
      }

      switch (this.state.animationPhase) {
        case "waiting to start":
          this.setState({animationPhase: "drawing word"});
          this._drawWord();
          // console.log('waiting to start animation');
          break;
        case "word drawn":
          this.setState({animationPhase: "swapping board", message: this.state.animation.points + " points"});
          this._swapBoards();
          // console.log('word drawn');
          break;
        case "board swapped":
          this.setState({animationPhase: "growing piece"});
          this._movePiece();
          // console.log('board swapped');
          break;
        case "piece moved":
          this.setState({animationPhase: "complete"});
          // console.log('piece moved');
          break;
        case "complete":
          // console.log('animation complete');
          clearInterval(interval);
          this.props.markAnimationPlayed(this.props.gameID);
          break;
      }

    }, 100);

  }

  _movePiece() {
    const { boardLocation, letterWidth, animation, overlay } = this.state;
    const { rowIndex, columnIndex } = animation.placementRef;

    const setAnimationPhaseComplete = () => this.setState({animationPhase: "piece moved"});
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear, setAnimationPhaseComplete);

    // executing callback after LayoutAnimation.configureNext is not supported on android, so do it manually
    if (Platform.OS === 'android') {
      setTimeout(setAnimationPhaseComplete, 500);
    }

    // use scale instead of width and height to have the lettering grow with the piece
    const scaleTo = letterWidth / (overlay.location.width / 4);
    const scaleOffset = ((overlay.location.width * scaleTo) - overlay.location.width) / 2;
    let scaleAnimated = new Animated.Value(1);

    Animated.timing(scaleAnimated, {
      toValue: scaleTo,
      duration: 300,
      useNativeDriver: true,
    }).start();

    this.setState({
      moveTo: {
        top: (boardLocation.y + (letterWidth * rowIndex)) + scaleOffset,
        left: (boardLocation.x + (letterWidth * columnIndex)) + scaleOffset,
        transform: [{scale: scaleAnimated}],
      }
    });
  }

  _drawWord() {
    let interval = setInterval( () => {
      const allSquares = this.state.animation.wordPath;
      const currentSquares = this.state.displayWordPath;
      if (currentSquares.length < allSquares.length) {
        this.setState({
          displayWordPath: allSquares.slice(0, currentSquares.length + 1),
        });
      } else {
        clearInterval(interval);
        this.setState({animationPhase: "word drawn"});
      }
    }, 500);
  }

  _swapBoards() {
    this.setState({
      boardState: this.state.animation.boardStates.between,
      displayWordPath: [],
      animationPhase: "board swapped"
    });
  }

  _measureBoard() {
    // console.log('measuring board');
    const animationContainerHandle = ReactNative.findNodeHandle(this._animationContainer);
    this._board.measureLayout(animationContainerHandle, (x, y, width, height) => {
      const boardLocation = {x, y, width, height};
      const letterWidth = width / 10;
      // console.log('layout measurement', {x, y, width, height});
      this.setState({boardLocation, letterWidth, boardSize: width});
    });
  }

  _measurePiece(pieceIndex) {
    // console.log('measuring piece', pieceIndex);
    if (!this.pieceRefs[pieceIndex]) return;

    const animationContainerHandle = ReactNative.findNodeHandle(this._animationContainer);

    this.pieceRefs[pieceIndex].measureLayout(animationContainerHandle, (x, y, width, height) => {
      // console.log('piece location:', {x, y, width, height});

      const locationStyles = {
        position: 'absolute',
        width,
        height,
        top: y,
        left: x,
        zIndex: 999,
      };

      this.setState({
        overlay: {
          location: {x, y, width, height},
          pieceIndex: pieceIndex,
          styles: locationStyles,
          pieceSize: width,
        }
      });
    });
  }

  _checkSpaceConsumed(usedSquares, rowIndex, columnIndex) {
    return usedSquares.reduce( (foundStatus, square) => {
      return (foundStatus || (rowIndex === square.rowIndex && columnIndex === square.columnIndex));
    }, false);
  }

}

const styles = StyleSheet.create({
  animationContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  boardSection: {
    flex: 14,
    justifyContent: 'center',
  },
  board: {
    aspectRatio: 1,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  moveInfoSection: {
    flex: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  gamePiecesSection: {
    flex: 4,
  },
  gamePiecesContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    paddingVertical: 10,
  },
  gamePieceContainer: {
    flex: 1,
    margin: 2,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  gamePieceBackground: {
    backgroundColor: 'gray',
  },
  gamePiece: {
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  },
});

const mapStateToProps = (state, ownProps) => {
  const gameID = ownProps.match.params.gameID;
  return {
    gameID: gameID,
    game: state.gameData.byID[gameID],
  };
};

const mapDispatchToProps = {
  markAnimationPlayed
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameMoveAnimation));
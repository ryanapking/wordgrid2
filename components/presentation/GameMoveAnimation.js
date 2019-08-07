import React, { useState, useEffect, useRef } from 'react';
import ReactNative, {
  Platform,
  StyleSheet,
  View,
  Text,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { markAnimationPlayed } from "../../data/redux/gameData";
import { getAnimationData } from "../../data/utilities/functions/getters";
import { useInterval } from "../hooks/useInterval";
import PieceDraggableView from "./PieceDraggableView";
import BoardPathCreator from "./BoardPathCreator";
import BoardDrawLetterGrid from './BoardDrawLetterGrid';
import PieceDrawLetterGrid from "./PieceDrawLetterGrid";

const GameMoveAnimation = props => {
  const dispatch = useDispatch();
  const boardRef = useRef(null);
  const animationContainerRef = useRef(null);
  const gamePiecesContainerRef = useRef(null);
  const activePieceRef = useRef(null);

  const [state, baseSetState] = useState({
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
  });

  const setState = (stateObject) => {
    baseSetState((currentState) => {
      return {
        ...currentState,
        ...stateObject,
      }
    });
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    const animation = getAnimationData(game);
    setState({
      animation: animation,
      boardState: animation.boardStates.start,
    });
  }, []);

  const { game, gameID } = props;
  const { boardLocation, animation, letterWidth, displayWordPath, boardState, boardSize, message, overlay } = state;

  useInterval(() => {
    // make sure all the needed data exists before starting the animation
    if (!state.animation || !state.boardLocation || !state.overlay.location) {
      return;
    }

    switch (state.animationPhase) {
      case "waiting to start":
        setState({animationPhase: "drawing word"});
        // there is a separate interval controlling this
        // console.log('waiting to start animation');
        break;
      case "word drawn":
        setState({animationPhase: "swapping board", message: state.animation.points + " points"});
        swapBoards();
        // console.log('word drawn');
        break;
      case "board swapped":
        setState({animationPhase: "growing piece"});
        movePiece();
        // console.log('board swapped');
        break;
      case "piece moved":
        setState({animationPhase: "complete"});
        // console.log('piece moved');
        break;
      case "complete":
        // console.log('animation complete');
        dispatch(markAnimationPlayed(gameID));
        break;
    }

  }, 100);

  const movePiece = () => {
    const { rowIndex, columnIndex } = animation.placementRef;

    const setAnimationPhaseComplete = () => setState({animationPhase: "piece moved"});
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

    setState({
      moveTo: {
        top: (boardLocation.y + (letterWidth * rowIndex)) + scaleOffset,
        left: (boardLocation.x + (letterWidth * columnIndex)) + scaleOffset,
        transform: [{scale: scaleAnimated}],
      }
    });
  };

  const drawWord = () => {
    if (state.animationPhase !== "drawing word") return;
    const allSquares = animation.wordPath;
    const currentSquares = displayWordPath;
    if (currentSquares.length < allSquares.length) {
      setState({
        displayWordPath: allSquares.slice(0, currentSquares.length + 1),
      });
    } else {
      setState({animationPhase: "word drawn"});
    }
  };
  useInterval(drawWord, 500);

  const swapBoards = () => {
    setState({
      boardState: animation.boardStates.between,
      displayWordPath: [],
      animationPhase: "board swapped"
    });
  };

  const measureBoard = () => {
    const animationContainerHandle = ReactNative.findNodeHandle(animationContainerRef.current);
    boardRef.current.measureLayout(animationContainerHandle, (x, y, width, height) => {
      const boardLocation = {x, y, width, height};
      const letterWidth = width / 10;
      setState({boardLocation, letterWidth, boardSize: width});
    });
  };

  const measurePiece = (pieceIndex) => {
    const animationContainerHandle = ReactNative.findNodeHandle(animationContainerRef.current);

    activePieceRef.current.measureLayout(animationContainerHandle, (x, y, width, height) => {
      console.log('piece location:', {x, y, width, height});

      const locationStyles = {
        position: 'absolute',
        width,
        height,
        top: y,
        left: x,
        zIndex: 999,
      };

      setState({
        overlay: {
          location: {x, y, width, height},
          pieceIndex: pieceIndex,
          styles: locationStyles,
          pieceSize: width,
        }
      });
    });
  };

  if (!animation) return null;

  // grab the appropriate pieces with styling
  const { pieceStates, placementRef } = animation;
  const { startIndexes, startPieces } = pieceStates;
  const pieces = startPieces.map( (letters, index) => {
    if (startIndexes[index] === placementRef.pieceIndex) {
      return {
        letters,
        ref: activePieceRef,
        animationStyles: null,
        onMeasure: () => measurePiece(index),
      };
    } else {
      return {
        letters,
        ref: null,
        animationStyles: null,
        onMeasure: () => {}
      }
    }
  });

  const displayBoardLocation = {
    rowHeight: letterWidth,
    columnWidth: letterWidth,
  };

  const displayWord = animation.word.substring(0, displayWordPath.length);

  return (
    <View style={styles.animationContainer} ref={animationContainerRef}>

      <View style={styles.gamePiecesSection}>
        <View style={styles.gamePiecesContainer}>
          { pieces.map( (piece, index) =>
            <View key={index} style={[styles.gamePieceContainer, {zIndex: 1}]} ref={gamePiecesContainerRef} >
              <View
                style={[styles.gamePiece, styles.gamePieceBackground]}
                ref={piece.ref}
                onLayout={ () => piece.onMeasure() }
              >
                { (overlay.pieceIndex === index) ? null :
                  <PieceDrawLetterGrid
                    style={styles.gamePiece}
                    piece={piece.letters}
                    pieceSize={overlay.pieceSize}
                  />
                }
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.boardSection}>
        <View style={styles.board} ref={boardRef} onLayout={() => measureBoard()}>
          <BoardDrawLetterGrid
            boardState={boardState}
            boardSize={boardSize}
            consumedSquares={displayWordPath}
            hoveredSquares={[]}
          />
          <BoardPathCreator squares={displayWordPath} boardLocation={displayBoardLocation}/>
        </View>
      </View>

      { !overlay.location ? null :
        <PieceDraggableView
          piece={pieces[overlay.pieceIndex].letters}
          style={[styles.gamePiece, overlay.styles, state.moveTo]}
          allowDrag={false}
          baseSize={overlay.pieceSize}
        >
          <PieceDrawLetterGrid
            piece={pieces[overlay.pieceIndex].letters}
            pieceSize={overlay.pieceSize}
          />
        </PieceDraggableView>
      }

      <View style={styles.moveInfoSection}>
        <Text style={{textAlign: 'center'}}>{ displayWord }</Text>
        <Text style={{textAlign: 'center'}}>{ message }</Text>
      </View>

    </View>
  );
};

GameMoveAnimation.propTypes = {
  // It's a game object. We aren't going to get more specific here.
  // Other functions are devoted to getting the right stuff.
  game: PropTypes.object.isRequired,
  gameID: PropTypes.string.isRequired,
};

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

export default GameMoveAnimation;
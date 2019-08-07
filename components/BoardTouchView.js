import React, { useMemo } from 'react';
import { PanResponder, StyleSheet, ViewPropTypes } from 'react-native';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { squaresArrayType, rowsType } from "../proptypes";
import MeasureView from "./MeasureView";
import { setBoardLocation } from "../data/redux/gameDisplay";
import { isSquareInArray } from "../data/utilities/functions/checks";

const BoardTouchView = props => {
  const { consumedSquares, rows } = props;
  const dispatch = useDispatch();
  const display = useSelector(state => state.gameDisplay, shallowEqual);

  const checkSquareAdjacent = (square) => {
    // if this is the first piece consumed, that's all we need to check
    if (consumedSquares.length === 0) return true;

    // checks a square against the previous square to determine if they are adjacent
    const previousSquare = consumedSquares[consumedSquares.length - 1];

    const columnDiff = Math.abs(previousSquare.columnIndex - square.columnIndex);
    const rowDiff = Math.abs(previousSquare.rowIndex - square.rowIndex);

    return (
      square.letter
      && (rowDiff <= 1)
      && (columnDiff <= 1)
      && (columnDiff + rowDiff !== 0)
    );
  };

  const checkSquareAvailable = (square) => {
    return !isSquareInArray(square, consumedSquares);
  };

  const checkIfLastSquarePlayed = (square) => {
    // simple function, but it's long and ugly
    if (consumedSquares.length < 1) {
      return false;
    } else {
      return (
        square.rowIndex === consumedSquares[consumedSquares.length - 1].rowIndex
        && square.columnIndex === consumedSquares[consumedSquares.length - 1].columnIndex
      );
    }
  };

  const checkIfNextToLastSquarePlayed = (square) => {
    // same as above... simple but long and ugly
    if (consumedSquares.length < 2) {
      return false;
    } else {
      return (
        square.rowIndex === consumedSquares[consumedSquares.length - 2].rowIndex
        && square.columnIndex === consumedSquares[consumedSquares.length - 2].columnIndex
      );
    }
  };

  const findSquareByCoordinates = (x, y) => {
    // to better enable diagonal movements, we define a circle 85% of its max possible size, to cut off the corners
    // kinda like a connect four board
    // we could use an octagon, but this math is simpler
    const maxDistance = display.boardLocation.columnWidth / 2 * .85;

    const nullIndex = -1;
    const nullSquare = {rowIndex: nullIndex, columnIndex: nullIndex};

    // reduce the two midpoint arrays into a single set of coordinates at the given point
    const square = display.boardLocation.rowMidPoints.reduce( (foundSquare, midPointY, rowIndex) => {
      const columnIndex = display.boardLocation.columnMidPoints.reduce( (foundColumnIndex, midPointX, columnIndex) => {
        const dist = Math.hypot(x - midPointX, y - midPointY);
        return dist < maxDistance ? columnIndex : foundColumnIndex;
      }, nullIndex);
      return columnIndex >= 0 ? {rowIndex, columnIndex} : foundSquare;
    }, nullSquare);

    const onBoard = (square.rowIndex >= 0 && square.columnIndex >= 0);
    const letter = onBoard ? rows[square.rowIndex][square.columnIndex] : null;

    return {...square, letter};
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: () => { return true; },
    onMoveShouldSetPanResponderCapture: () => { return true },
    onPanResponderGrant: (event) => {
      const square = findSquareByCoordinates(event.nativeEvent.pageX, event.nativeEvent.pageY);

      if(!square.letter) return;

      if (checkSquareAdjacent(square) && checkSquareAvailable(square)) {
        props.consumeSquare(square);
      } else if (checkIfNextToLastSquarePlayed(square)) {
        props.removeSquare();
      } else {
        props.clearConsumedSquares();
        props.consumeSquare(square);
      }
    },
    onPanResponderMove: (event) => {
      const square = findSquareByCoordinates(event.nativeEvent.pageX, event.nativeEvent.pageY);

      if(!square.letter) return;

      if (square.columnIndex === -1 || square.rowIndex === -1) {
        // do nothing if event is not on a valid square
        // note: square can be invalid if the point clicked is outside of the circle used to define its space
        // this is no big deal in the current setup
      } else if (checkIfNextToLastSquarePlayed(square)) {
        // allows for backtracking while spelling a word
        props.removeSquare();
      } else if (checkSquareAdjacent(square) && checkSquareAvailable(square)) {
        props.consumeSquare(square);
      }
    },
    onPanResponderRelease: () => {
      // if (this.props.consumedSquares.length === 1) {
      //   this.props.clearConsumedSquares();
      // }
    },
  }), [consumedSquares, display]);

  return(
    <MeasureView
      style={[styles.base, props.style]}
      onMeasure={ (x, y, width, height, pageX, pageY) => dispatch(setBoardLocation(pageX, pageY, width, height)) }
      panHandlers={panResponder.panHandlers}
      pointerEvents={props.pointerEventsDisabled ? 'none' : 'auto'}
    >
      { props.children }
    </MeasureView>
  );
};

BoardTouchView.propTypes = {
  rows: rowsType.isRequired,
  consumedSquares: squaresArrayType.isRequired,
  style: ViewPropTypes.style,
  pointerEventsDisabled: PropTypes.bool,
  consumeSquare: PropTypes.func.isRequired,
  removeSquare: PropTypes.func.isRequired,
  clearConsumedSquares: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    aspectRatio: 1
  },
});

export default BoardTouchView;
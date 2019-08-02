import React, { Component } from 'react';
import { PanResponder, StyleSheet, ViewPropTypes } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { squaresArrayType, rowsType } from "../../proptypes";
import MeasureView from "./MeasureView";
import { setBoardLocation } from "../../data/redux/gameDisplay";
import { isSquareInArray } from "../../data/utilities/functions/checks";

class BoardTouchView extends Component {
  constructor(props) {
    super(props);

    this._onStartShouldSetPanResponderCapture = this._onStartShouldSetPanResponderCapture.bind(this);
    this._onMoveShouldSetPanResponderCapture = this._onMoveShouldSetPanResponderCapture.bind(this);
    this._onPanResponderGrant = this._onPanResponderGrant.bind(this);
    this._onPanResponderMove = this._onPanResponderMove.bind(this);
    this._onPanResponderRelease = this._onPanResponderRelease.bind(this);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: this._onStartShouldSetPanResponderCapture,
      onMoveShouldSetPanResponderCapture: this._onMoveShouldSetPanResponderCapture,
      onPanResponderGrant: this._onPanResponderGrant,
      onPanResponderMove: this._onPanResponderMove,
      onPanResponderRelease: this._onPanResponderRelease
    });
  }

  render() {
    return(
      <MeasureView
        style={[styles.base, this.props.style]}
        onMeasure={ (x, y, width, height, pageX, pageY) => this.props.setBoardLocation(pageX, pageY, width, height) }
        panHandlers={this.panResponder.panHandlers}
        pointerEvents={this.props.pointerEventsDisabled ? 'none' : 'auto'}
      >
        { this.props.children }
      </MeasureView>
    );
  }

  _findSquareByCoordinates(x, y) {
    // to better enable diagonal movements, we define a circle 85% of its max possible size, to cut off the corners
    // kinda like a connect four board
    // we could use an octagon, but this math is simpler
    const maxDistance = this.props.display.boardLocation.columnWidth / 2 * .85;

    const nullIndex = -1;
    const nullSquare = {rowIndex: nullIndex, columnIndex: nullIndex};

    // reduce the two midpoint arrays into a single set of coordinates at the given point
    const square = this.props.display.boardLocation.rowMidPoints.reduce( (foundSquare, midPointY, rowIndex) => {
      const columnIndex = this.props.display.boardLocation.columnMidPoints.reduce( (foundColumnIndex, midPointX, columnIndex) => {
        const dist = Math.hypot(x - midPointX, y - midPointY);
        return dist < maxDistance ? columnIndex : foundColumnIndex;
      }, nullIndex);
      return columnIndex >= 0 ? {rowIndex, columnIndex} : foundSquare;
    }, nullSquare);

    const onBoard = (square.rowIndex >= 0 && square.columnIndex >= 0);
    const letter = onBoard ? this.props.rows[square.rowIndex][square.columnIndex] : null;

    return {...square, letter};
  }

  _checkSquareAdjacent(square) {
    // if this is the first piece consumed, that's all we need to check
    if (this.props.consumedSquares.length === 0) return true;

    // checks a square against the previous square to determine if they are adjacent
    const previousSquare = this.props.consumedSquares[this.props.consumedSquares.length - 1];

    const columnDiff = Math.abs(previousSquare.columnIndex - square.columnIndex);
    const rowDiff = Math.abs(previousSquare.rowIndex - square.rowIndex);

    return (
      square.letter
      && (rowDiff <= 1)
      && (columnDiff <= 1)
      && (columnDiff + rowDiff !== 0)
    );
  }

  _checkSquareAvailable(square) {
    const { consumedSquares } = this.props;
    return !isSquareInArray(square, consumedSquares);
  }

  _checkIfLastSquarePlayed(square) {
    // simple function, but it's long and ugly
    if (this.props.consumedSquares.length < 1) {
      return false;
    } else {
      return (
        square.rowIndex === this.props.consumedSquares[this.props.consumedSquares.length - 1].rowIndex
        && square.columnIndex === this.props.consumedSquares[this.props.consumedSquares.length - 1].columnIndex
      );
    }
  }

  _checkIfNextToLastSquarePlayed(square) {
    // same as above... simple but long and ugly
    if (this.props.consumedSquares.length < 2) {
      return false;
    } else {
      return (
        square.rowIndex === this.props.consumedSquares[this.props.consumedSquares.length - 2].rowIndex
        && square.columnIndex === this.props.consumedSquares[this.props.consumedSquares.length - 2].columnIndex
      );
    }
  }

  _onPanResponderGrant(event) {
    const square = this._findSquareByCoordinates(event.nativeEvent.pageX, event.nativeEvent.pageY);

    if(!square.letter) return;

    if (this._checkSquareAdjacent(square) && this._checkSquareAvailable(square)) {
      this.props.consumeSquare(square);
    } else if (this._checkIfNextToLastSquarePlayed(square)) {
      this.props.removeSquare();
    } else {
      this.props.clearConsumedSquares();
      this.props.consumeSquare(square);
    }
  }

  _onPanResponderMove(event) {
    const square = this._findSquareByCoordinates(event.nativeEvent.pageX, event.nativeEvent.pageY);

    if(!square.letter) return;

    if (square.columnIndex === -1 || square.rowIndex === -1) {
      // do nothing if event is not on a valid square
      // note: square can be invalid if the point clicked is outside of the circle used to define its space
      // this is no big deal in the current setup
    } else if (this._checkIfNextToLastSquarePlayed(square)) {
      // allows for backtracking while spelling a word
      this.props.removeSquare();
    } else if (this._checkSquareAdjacent(square) && this._checkSquareAvailable(square)) {
      this.props.consumeSquare(square);
    }
  }

  _onPanResponderRelease() {
    // if (this.props.consumedSquares.length === 1) {
    //   this.props.clearConsumedSquares();
    // }
  }

  _onStartShouldSetPanResponderCapture() {
    return true;
  }

  _onMoveShouldSetPanResponderCapture() {
    return true;
  }

  static propTypes = {
    rows: rowsType,
    consumedSquares: squaresArrayType,
    style: ViewPropTypes.style,
    pointerEventsDisabled: PropTypes.bool,
    consumeSquare: PropTypes.func,
    removeSquare: PropTypes.func,
    clearConsumedSquares: PropTypes.func,
  }
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    aspectRatio: 1
  },
});

const mapStateToProps = (state) => {
  return {
    display: state.gameDisplay,
  }
};

const mapDispatchToProps = {
  setBoardLocation
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardTouchView);
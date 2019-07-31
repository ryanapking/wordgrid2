import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { SPACE_STATES } from "../data/utilities/constants";
import { isSquareInArray } from "../data/utilities/functions/checks";
import DrawLetter from "./DrawLetter";

export default class DrawBoard extends Component {
  render() {
    const { boardState, boardSize, consumedSquares, hoveredSquares } = this.props;
    const letterHeight = (boardSize > 0) ? (boardSize / 10) : 0;

    const displayBoardState = boardState.map( (row, rowIndex) => {
      return row.map( (letter, columnIndex) => {

        const square = {rowIndex, columnIndex};
        const squareHovered = isSquareInArray(square, hoveredSquares);
        const squareConsumed = isSquareInArray(square, consumedSquares);

        if (!letter && squareHovered) {
          return {letter, status: SPACE_STATES.SPACE_EMPTY_HOVERED}
        } else if (!letter) {
          return {letter, status: SPACE_STATES.SPACE_EMPTY};
        } else if (squareConsumed) {
          return {letter, status: SPACE_STATES.SPACE_CONSUMED};
        } else if (squareHovered){
          return {letter, status: SPACE_STATES.SPACE_FILLED_HOVERED};
        } else {
          return {letter, status: SPACE_STATES.SPACE_FILLED};
        }
      });
    });

    return (
      <View style={styles.grid}>
        {displayBoardState.map((row, rowIndex) =>
          <View key={rowIndex} style={styles.row}>
            {row.map( (square, columnIndex) => {
              const fillStyle = this._getFillStyle(square.status);
              return (
                <View key={columnIndex} style={[styles.centered, styles.column, fillStyle]}>
                  <DrawLetter letter={square.letter} style={fillStyle} letterSize={letterHeight}/>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  _getFillStyle(status) {
    switch (status) {
      case SPACE_STATES.SPACE_EMPTY:
        return styles.emptySquare;
      case SPACE_STATES.SPACE_EMPTY_HOVERED:
        return styles.emptySquareHovered;
      case SPACE_STATES.SPACE_FILLED:
        return styles.filledSquare;
      case SPACE_STATES.SPACE_FILLED_HOVERED:
        return styles.filledSquareHovered;
      case SPACE_STATES.SPACE_CONSUMED:
        return styles.consumedSquare;
      default:
        return styles.emptySquare;
    }
  }

  static propTypes = {
    boardState:
      PropTypes.arrayOf(
        PropTypes.arrayOf(
          PropTypes.string
        )
      ),
    boardSize: PropTypes.number,
  }
}

const styles = StyleSheet.create({
  grid: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  row: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row'
  },
  column: {
    flex: 1
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledSquare: {
    backgroundColor: "#ffd27b",
  },
  filledSquareHovered: {
    backgroundColor: "indianred",
  },
  emptySquare: {
    backgroundColor: "#9c9c9c"
  },
  emptySquareHovered: {
    backgroundColor: "green",
  },
  consumedSquare: {
    backgroundColor: "#ffa487",
  },
});
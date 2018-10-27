import React, { Component } from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';

import { SPACE_EMPTY, SPACE_FILLED, SPACE_CONSUMED } from "../constants";
import DrawLetter from "./DrawLetter";

export default class DrawBoard extends Component {
  render() {
    const { boardState, boardSize } = this.props;
    const letterHeight = (boardSize > 0) ? (boardSize / 10) : 0;
    return (
      <View style={styles.grid}>
        {boardState.map((row, rowIndex) =>
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
      case SPACE_EMPTY:
        return styles.emptySquare;
      case SPACE_FILLED:
        return styles.filledSquare;
      case SPACE_CONSUMED:
        return styles.consumedSquare;
      default:
        return styles.emptySquare;
    }
  }

  static propTypes = {
    boardState:
      PropTypes.arrayOf(
        PropTypes.arrayOf(
          PropTypes.shape({
            letter: PropTypes.string,
            status: PropTypes.number
          })
        )
      ),
    boardSize: PropTypes.number
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
  emptySquare: {
    backgroundColor: "#9c9c9c"
  },
  consumedSquare: {
    backgroundColor: "#ffa487",
  },
});
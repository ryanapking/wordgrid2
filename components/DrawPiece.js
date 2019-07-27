import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import DrawLetter from "./DrawLetter";
import PropTypes from "prop-types";

export default class DrawPiece extends Component {
  render() {
    const { pieceSize, pieceState, canDrop } = this.props;
    const letterHeight = (pieceSize > 0) ? (pieceSize / 4) : 0;
    const dragStyles = canDrop ? styles.canDrop : null;
    return (
      <View style={[styles.grid, this.props.style]} pointerEvents={'none'}>
        {pieceState.map( (row, rowIndex) =>
          <View style={styles.row} key={rowIndex}>
            {row.map( (square, columnIndex) =>
              <View style={styles.column} key={columnIndex}>
                { square.letter ? <DrawLetter style={dragStyles} letter={square.letter} letterSize={letterHeight}/> : null}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  static propTypes = {
    pieceState:
      PropTypes.arrayOf(
        PropTypes.arrayOf(
          PropTypes.shape({
            letter: PropTypes.string,
            status: PropTypes.number
          })
        )
      ),
    pieceSize: PropTypes.number,
    canDrop: PropTypes.bool
  }
}

const styles = StyleSheet.create({
  square: {
    width: "100%",
    height: "100%",
  },
  canDrop: {
    backgroundColor: '#55a22e'
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    flex: 1,
  }
});
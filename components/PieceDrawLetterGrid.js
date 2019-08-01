import React, { Component } from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import DrawLetter from "./DrawLetter";
import PropTypes from "prop-types";

import { letterGridType } from "../proptypes";

export default class PieceDrawLetterGrid extends Component {
  render() {
    const { pieceSize, piece, canDrop } = this.props;
    const letterHeight = (pieceSize > 0) ? (pieceSize / 4) : 0;
    const dragStyles = canDrop ? styles.canDrop : null;
    return (
      <View style={[styles.grid, this.props.style]} pointerEvents={'none'}>
        {piece.map( (row, rowIndex) =>
          <View style={styles.row} key={rowIndex}>
            {row.map( (letter, columnIndex) =>
              <View style={styles.column} key={columnIndex}>
                { letter ? <DrawLetter style={dragStyles} letter={letter} letterSize={letterHeight}/> : null}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  static propTypes = {
    piece: letterGridType.isRequired,
    style: ViewPropTypes.style,
    pieceSize: PropTypes.number,
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
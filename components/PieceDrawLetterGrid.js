import React from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import PropTypes from "prop-types";

import DrawLetter from "./DrawLetter";
import { letterGridType } from "../proptypes";

const PieceDrawLetterGrid = props => {
  const { pieceSize, piece, canDrop } = props;
  const letterHeight = (pieceSize > 0) ? (pieceSize / 4) : 0;
  const dragStyles = canDrop ? styles.canDrop : null;
  return (
    <View style={[styles.grid, props.style]} pointerEvents={'none'}>
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
};

PieceDrawLetterGrid.propTypes = {
  piece: letterGridType.isRequired,
  style: ViewPropTypes.style,
  pieceSize: PropTypes.number,
};

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

export default PieceDrawLetterGrid;
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from "prop-types";

import BoardDrawPath from './BoardDrawPath';

const BoardPathCreator = props => {
  const { squares, boardLocation } = props;

  if (!boardLocation.rowHeight || !boardLocation.columnWidth) return null;

  // split the consumedSquares into pairs, to allow a path section to be rendered
  const squarePairs = squares
    .map( (square, squareIndex) => {
      return squares.slice(squareIndex - 1, squareIndex + 1);
    })
    .filter( (pair) => {
      return pair.length === 2;
    });

  return (
    <View style={styles.overlay} pointerEvents={'none'}>
      {squarePairs.map( (pair, pairIndex) =>
        <BoardDrawPath key={pairIndex} square1={pair[0]} square2={pair[1]} boardLocation={boardLocation}/>
      )}
    </View>
  );
};

BoardPathCreator.propTypes = {
  squares: PropTypes.arrayOf(
    PropTypes.shape({
      rowIndex: PropTypes.number,
      columnIndex: PropTypes.number,
    })
  ),
  boardLocation: PropTypes.shape({
    rowHeight: PropTypes.number,
    columnWidth: PropTypes.number,
  }),
};


const styles = StyleSheet.create({
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  }
});

export default BoardPathCreator;
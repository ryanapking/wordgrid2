import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { squaresArrayType, rowsType } from "../../proptypes";
import { isSquareInArray } from "../../data/utilities/functions/checks";
import DrawLetter from "../DrawLetter";

const BoardDrawLetterGrid = props => {
  const { boardState, boardSize, consumedSquares, hoveredSquares } = props;

  const letterHeight = useMemo(() => {
    return boardSize > 0 ? boardSize / 10 : 0;
  }, [boardSize]);

  const displayBoardState = useMemo(() => {
    return boardState.map( (row, rowIndex) => {
      return row.map( (letter, columnIndex) => {

        let square = { rowIndex, columnIndex, letter };
        const squareHovered = hoveredSquares && isSquareInArray(square, hoveredSquares);
        const squareConsumed = consumedSquares && isSquareInArray(square, consumedSquares);

        if (!letter && squareHovered) {
          square.fillStyle = styles.emptySquareHovered;
        } else if (!letter) {
          square.fillStyle = styles.emptySquare;
        } else if (squareConsumed) {
          square.fillStyle = styles.consumedSquare;
        } else if (squareHovered){
          square.fillStyle = styles.filledSquareHovered;
        } else {
          square.fillStyle = styles.filledSquare;
        }

        return square;
      });
    });
  }, [boardState, hoveredSquares, consumedSquares]);

  return (
    <View style={styles.grid}>
      {displayBoardState.map((row, rowIndex) =>
        <View key={rowIndex} style={styles.row}>
          {row.map( (square, columnIndex) =>
            <View key={columnIndex} style={[styles.centered, styles.column, square.fillStyle]}>
              <DrawLetter
                letter={square.letter}
                style={square.fillStyle}
                letterSize={letterHeight}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

BoardDrawLetterGrid.propTypes = {
  boardState: rowsType.isRequired,
  boardSize: PropTypes.number,
  consumedSquares: squaresArrayType,
  hoveredSquares: squaresArrayType,
};

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

export default BoardDrawLetterGrid;
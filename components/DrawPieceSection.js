import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { rowsArrayType } from "../proptypes";
import PieceDraggableView from './PieceDraggableView';
import PieceDrawLetterGrid from "./PieceDrawLetterGrid";
import MeasureView from "./MeasureView";
import { setPieceLocation as reduxSetPieceLocation, clearPieceLocations } from "../data/redux/gameDisplay";

const DrawPieceSection = props => {
  const [pieceLocations, setPieceLocations] = useState({});
  const dispatch = useDispatch();
  const { allowDrag, pieces } = props;

  const setPieceLocation = (piece, pieceIndex, location) => {
    const pieceLocation = { ...location, piece };

    // set local pieceLocation
    setPieceLocations(pieceLocations => {
      return {
        ...pieceLocations,
        [pieceIndex]: pieceLocation
      }
    });

    // set the piece location for the overlay
    if (allowDrag) {
      dispatch(reduxSetPieceLocation(pieceIndex, pieceLocation));
    }
  };

  // clear piece locations from redux on unmount
  useEffect(() => {
    return () => {
      /* istanbul ignore else*/
      if (allowDrag) {
        dispatch(clearPieceLocations());
      }
    }
  }, []);

  return (
    <View style={[props.style, styles.container]}>
      { pieces.map( (piece, pieceIndex) => {
        const baseSize = pieceLocations[pieceIndex] ? pieceLocations[pieceIndex].width : 0;
        return (
          <View style={styles.gamePieceContainer} key={pieceIndex}>
            <MeasureView
              style={styles.gamePiece}
              onMeasure={ (x, y, width, height, pageX, pageY) => setPieceLocation(piece, pieceIndex, {x, y, width, height, pageX, pageY}) }
            >
              { allowDrag ? null :
                <PieceDraggableView
                  piece={piece}
                  pieceIndex={pieceIndex}
                  style={styles.gamePiece}
                  allowDrag={allowDrag}
                  baseSize={baseSize}
                >
                  <PieceDrawLetterGrid
                    piece={piece}
                    pieceSize={baseSize}
                  />
                </PieceDraggableView>
              }
            </MeasureView>
          </View>
        );
      })}
    </View>
  );
};

DrawPieceSection.propTypes = {
  allowDrag: PropTypes.bool,
  pieces: rowsArrayType.isRequired,
  style: ViewPropTypes.style,
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  gamePieceContainer: {
    flex: 1,
    margin: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxHeight: '100%',
    maxWidth: '100%',
  },
  gamePiece: {
    backgroundColor: 'gray',
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: 1,
  }
});

export default DrawPieceSection;
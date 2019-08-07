import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';

import { rowsType } from "../../proptypes";
import PieceDraggableView from "./PieceDraggableView";

import MeasureView from "./MeasureView";
import PieceDrawLetterGrid from "./PieceDrawLetterGrid";

const PieceOverlay = props => {
  const pieceLocations = useSelector(state => state.gameDisplay.pieceLocations, shallowEqual);
  const [offset, setOffset] = useState({x: 0, y: 0});

  const pieceIndexes = Object.keys(pieceLocations);

  let locations = {};
  pieceIndexes.forEach( (pieceIndex) => {
    const loc = pieceLocations[pieceIndex];
    locations[pieceIndex] = {
      top: loc.pageY - offset.y,
      left: loc.pageX - offset.x,
      width: loc.width,
      height: loc.height,
      position: 'absolute',
    }
  });

  return (
    <MeasureView
      style={[styles.overlay, props.style]}
      onMeasure={ (x, y, width, height, pageX, pageY) => setOffset({x: pageX, y: pageY}) }
    >
      { pieceIndexes.map( (pieceIndex) =>
        <View key={pieceIndex} style={[locations[pieceIndex], styles.pieceBackground]} />
      )}
      { pieceIndexes.map( (pieceIndex) =>
        <PieceDraggableView
          key={pieceIndex}
          piece={pieceLocations[pieceIndex].piece}
          style={locations[pieceIndex]}
          allowDrag={true}
          baseSize={pieceLocations[pieceIndex].width}
          boardRows={props.boardRows}
          placePiece={(rowRef, columnRef) => props.placePiece(pieceIndex, rowRef, columnRef)}
        >
          <PieceDrawLetterGrid
            piece={pieceLocations[pieceIndex].piece}
            pieceSize={pieceLocations[pieceIndex].width}
          />
        </PieceDraggableView>
      )}
    </MeasureView>
  );
};

PieceOverlay.propTypes = {
  pointerEvents: PropTypes.string,
  boardRows: rowsType.isRequired,
  placePiece: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // backgroundColor: 'green',
  },
  pieceBackground: {
    backgroundColor: 'gray',
  }
});

export default PieceOverlay;
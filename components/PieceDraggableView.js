import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, PanResponder, Animated, ViewPropTypes } from 'react-native';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import PropTypes from 'prop-types'

import { setHoveredSpaces as reduxSetHoveredSpaces, clearHoveredSpaces } from "../data/redux/gameDisplay";
import { validatePlacement } from "../data/utilities/functions/checks";

const PieceDraggableView = props => {
  const { allowDrag, baseSize, piece, boardRows, placePiece } = props;
  const dispatch = useDispatch();
  const boardLocation = useSelector(state => state.gameDisplay.boardLocation, shallowEqual);

  const pan = useRef(new Animated.ValueXY());
  const [scale] = useState(new Animated.Value(1));

  const [dragging, setDragging] = useState(false);
  const [lastSetHoveredSpaces, setLastSetHoveredSpaces] = useState(null);


  // rate limiter for reduxSetHoveredSpaces
  // TODO: this is only kind of working
  const setHoveredSpaces = (hoveringRef) => {
    setLastSetHoveredSpaces ((lastSetHoveredSpaces) => {
      if (!lastSetHoveredSpaces || (Date.now() - lastSetHoveredSpaces > 200)) {
        // console.log('setting hovered spaces');
        let hoveredSpaces = [];
        piece.forEach( (row, pieceRowIndex) => {
          row.forEach( (letter, pieceColumnIndex) => {
            if (letter) {
              hoveredSpaces.push({
                rowIndex: pieceRowIndex + hoveringRef.rowIndex,
                columnIndex: pieceColumnIndex + hoveringRef.columnIndex,
              });
            }
          });
        });
        setLastSetHoveredSpaces(Date.now());
        dispatch(reduxSetHoveredSpaces(hoveredSpaces));
      } else {
        return lastSetHoveredSpaces;
      }
    });
  };

  const getPlacementRef = (event) => {
    const currentScale = scale._value;
    // console.log('current scale:', currentScale);

    // event location (aka pointer location) relative to the game board
    const eventBoardX = event.nativeEvent.pageX - boardLocation.x;
    const eventBoardY = event.nativeEvent.pageY - boardLocation.y;
    // console.log('board relative:', {x: eventBoardX, y: eventBoardY});

    // locationX and locationY are set based on initial size, so the distances must be scaled
    const scaledLocationX = (event.nativeEvent.locationX * currentScale);
    const scaledLocationY = (event.nativeEvent.locationY * currentScale);
    // console.log('scaled location:', {x: scaledLocationX, y: scaledLocationY});

    // upper left of piece relative to the game board
    const pieceBoardX = eventBoardX - scaledLocationX;
    const pieceBoardY = eventBoardY - scaledLocationY;
    // console.log('piece relative:', {x: pieceBoardX, y: pieceBoardY});

    // the center point of the upper left tile relative to the board
    const pieceOffset = (baseSize * currentScale) / 8;
    const offsetX = pieceBoardX + pieceOffset;
    const offsetY = pieceBoardY + pieceOffset;
    // console.log('offset:', {x: offsetX, y: offsetY});

    // calculate row and column
    const columnIndex = Math.floor(offsetX / boardLocation.columnWidth);
    const rowIndex = Math.floor(offsetY / boardLocation.rowHeight);

    // console.log('hovering:', {row: rowIndex, column: columnIndex});

    return { rowIndex, columnIndex };
  };

  useEffect(() => {
    scale.addListener(() => {
      // our listener doesn't do anything, but without it the scale value is unchanged in the callbacks below
      // TODO: why now?
    });
  }, []);

  // create the panresponder
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: () => { return allowDrag },
    onMoveShouldSetPanResponderCapture: () => { return allowDrag },
    onPanResponderGrant: () => {
      setDragging(true);
      pan.current.setValue({x: 0, y: 0});
      const scaleTo = boardLocation.rowHeight / (baseSize / 4);
      Animated.timing(scale, {
        toValue: scaleTo,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (event, gestureState) => {
      // console.log('scale:', scale._value);
      Animated.event([null, {
        dx: pan.current.x,
        dy: pan.current.y,
      }])(event, gestureState);

      const placementRef = getPlacementRef(event);
      setHoveredSpaces(placementRef);
    },
    onPanResponderRelease: (event) => {
      setDragging(false);
      Animated.timing(pan.current, {
        toValue: { x: 0, y: 0 },
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const placementRef = getPlacementRef(event);
      const canDrop = validatePlacement(piece, placementRef, boardRows);

      dispatch(clearHoveredSpaces());

      if (canDrop) {
        placePiece(placementRef.rowIndex, placementRef.columnIndex);
      }
    },
  }), []);

  const dragTransforms = {transform: [{translateX: pan.current.x}, {translateY: pan.current.y}, {scale: scale}]};
  const opacity = { opacity: dragging ? .65 : 1};


  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.square, dragTransforms, props.style, opacity]}
    >
      {props.children}
    </Animated.View>
  );

};

PieceDraggableView.propTypes = {
  piece: PropTypes.array.isRequired,
  baseSize: PropTypes.number.isRequired,
  placePiece: PropTypes.func,
  boardRows: PropTypes.array,
  allowDrag: PropTypes.bool,
  style: ViewPropTypes.style,
};

const styles = StyleSheet.create({
  square: {
    width: "100%",
    height: "100%",
  },
  grid: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
});

export default PieceDraggableView;
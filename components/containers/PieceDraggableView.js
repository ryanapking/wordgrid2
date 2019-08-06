import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, PanResponder, Animated, ViewPropTypes } from 'react-native';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import PropTypes from 'prop-types'

import { setHoveredSpaces as reduxSetHoveredSpaces, clearHoveredSpaces } from "../../data/redux/gameDisplay";
import { validatePlacement } from "../../data/utilities/functions/checks";

const PieceDraggableView = props => {
  const { allowDrag, baseSize, piece, boardRows, placePiece } = props;
  const dispatch = useDispatch();
  const boardLocation = useSelector(state => state.gameDisplay.boardLocation, shallowEqual);

  const pan = useRef(new Animated.ValueXY());
  const scale = useRef(new Animated.Value(1));

  const [dragging, setDragging] = useState(false);
  const [relativeReferencePoint, setRelativeReferencePoint] = useState({ x: 0, y: 0 });
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
    // set the x and y coordinates of the top left corner of the piece being dragged
    // locationX and locationY are set based on initial size, so the distances must be scaled
    const scaledX = event.nativeEvent.pageX - (event.nativeEvent.locationX * scale.current._value);
    const scaledY = event.nativeEvent.pageY - (event.nativeEvent.locationY * scale.current._value);

    // add the relative x and y for the midpoint of the top left square of the piece
    const placementRefX = scaledX + relativeReferencePoint.x;
    const placementRefY = scaledY + relativeReferencePoint.y;

    // subtract board location to get our x and y relative to the board
    const boardX = placementRefX - boardLocation.x;
    const boardY = placementRefY - boardLocation.y;

    // calculate row and column
    const columnIndex = Math.floor(boardX / boardLocation.columnWidth);
    const rowIndex = Math.floor(boardY / boardLocation.rowHeight);

    return { rowIndex, columnIndex };
  };

  // TODO: this is not updating the relative reference point as expected
  useEffect(() => {
    // Add a listener for the delta value change
    scale.current.addListener((currentScale) => {
      // use the base piece size and current scale to determine the piece's current size
      const pieceHeight = baseSize * currentScale.value;
      const pieceWidth = baseSize * currentScale.value;
      setRelativeReferencePoint({
        x: (pieceHeight / 8),
        y: (pieceWidth / 8),
      });
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
      Animated.timing(scale.current, {
        toValue: scaleTo,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (event, gestureState) => {
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
      Animated.timing(scale.current, {
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

  const dragTransforms = {transform: [{translateX: pan.current.x}, {translateY: pan.current.y}, {scale: scale.current}]};
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
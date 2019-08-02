import React, { Component } from 'react';
import { StyleSheet, View, PanResponder, Animated, ViewPropTypes } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import PropTypes from 'prop-types'

import { setHoveredSpaces, clearHoveredSpaces } from "../../data/redux/gameDisplay";
import { validatePlacement } from "../../data/utilities/functions/checks";

class PieceDraggableView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // used for local animations
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),

      // used for styling the current piece
      dragging: false,
    };

    this.lastSetHoveredSpaces = null;

    // middle point of the upper left letter tile (empty or not)
    this.relativeReferencePoint = {
      x: 0,
      y: 0
    };

    this._onStartShouldSetPanResponderCapture = this._onStartShouldSetPanResponderCapture.bind(this);
    this._onMoveShouldSetPanResponderCapture = this._onMoveShouldSetPanResponderCapture.bind(this);
    this._onPanResponderGrant = this._onPanResponderGrant.bind(this);
    this._onPanResponderRelease = this._onPanResponderRelease.bind(this);
    this._onPanResponderMove = this._onPanResponderMove.bind(this);
    this._getPlacementRef = this._getPlacementRef.bind(this);
    this._setRelativeReferencePoint = this._setRelativeReferencePoint.bind(this);

    // Add a listener for the delta value change
    this.state.scale.addListener((value) => this._setRelativeReferencePoint(value));

    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: this._onStartShouldSetPanResponderCapture,
      onMoveShouldSetPanResponderCapture: this._onMoveShouldSetPanResponderCapture,
      onPanResponderGrant: this._onPanResponderGrant,
      onPanResponderMove: this._onPanResponderMove,
      onPanResponderRelease: this._onPanResponderRelease,
    });
  }

  render() {
    const { pan, scale, dragging } = this.state;
    const dragTransforms = {transform: [{translateX: pan.x}, {translateY: pan.y}, {scale}]};
    const opacity = { opacity: dragging ? .65 : 1};

    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[styles.square, dragTransforms, this.props.style, opacity]}
      >
        {this.props.children}
      </Animated.View>
    );
  }

  _setRelativeReferencePoint(currentScale) {
    // use the base piece size and current scale to determine the piece's current size
    const pieceHeight = this.props.baseSize * currentScale.value;
    const pieceWidth = this.props.baseSize * currentScale.value;
    this.relativeReferencePoint = {
      x: (pieceHeight / 8),
      y: (pieceWidth / 8),
    };
  }

  _getPlacementRef(event) {
    // set the x and y coordinates of the top left corner of the piece being dragged
    // locationX and locationY are set based on initial size, so the distances must be scaled
    const scaledX = event.nativeEvent.pageX - (event.nativeEvent.locationX * this.state.scale._value);
    const scaledY = event.nativeEvent.pageY - (event.nativeEvent.locationY * this.state.scale._value);

    // add the relative x and y for the midpoint of the top left square of the piece
    const placementRefX = scaledX + this.relativeReferencePoint.x;
    const placementRefY = scaledY + this.relativeReferencePoint.y;

    // subtract board location to get our x and y relative to the board
    const boardX = placementRefX - this.props.boardLocation.x;
    const boardY = placementRefY - this.props.boardLocation.y;

    // calculate row and column
    const columnIndex = Math.floor(boardX / this.props.boardLocation.columnWidth);
    const rowIndex = Math.floor(boardY / this.props.boardLocation.rowHeight);

    return { rowIndex, columnIndex };
  }

  _onStartShouldSetPanResponderCapture() {
    return this.props.allowDrag;
  }

  _onMoveShouldSetPanResponderCapture() {
    return this.props.allowDrag;
  }

  _onPanResponderGrant() {
    const { baseSize } = this.props;
    this.setState({ dragging: true });
    this.state.pan.setValue({x: 0, y: 0});
    const scaleTo = this.props.boardLocation.rowHeight / (baseSize / 4);
    Animated.timing(this.state.scale, {
      toValue: scaleTo,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  _onPanResponderRelease(event) {
    this.setState({ dragging: false });
    Animated.timing(this.state.pan, {
      toValue: { x: 0, y: 0 },
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(this.state.scale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const placementRef = this._getPlacementRef(event);
    const canDrop = validatePlacement(this.props.piece, placementRef, this.props.boardRows);

    this.props.clearHoveredSpaces();

    if (canDrop) {
      this.props.placePiece(placementRef.rowIndex, placementRef.columnIndex);
    }
  }

  _onPanResponderMove(event, gestureState) {
    Animated.event([null, {
      dx: this.state.pan.x,
      dy: this.state.pan.y,
    }])(event, gestureState);

    const placementRef = this._getPlacementRef(event);
    this._setHoveredSpaces(placementRef);
  }

  _setHoveredSpaces(hoveringRef) {
    if (!this.lastSetHoveredSpaces || (Date.now() - this.lastSetHoveredSpaces > 200)) {
      // console.log('setting hoveringRef');
      let hoveredSpaces = [];
      this.props.piece.forEach( (row, pieceRowIndex) => {
        row.forEach( (letter, pieceColumnIndex) => {
          if (letter) {
            hoveredSpaces.push({
              rowIndex: pieceRowIndex + hoveringRef.rowIndex,
              columnIndex: pieceColumnIndex + hoveringRef.columnIndex,
            });
          }
        });
      });
      // console.log('board spaces:', hoveredSpaces);
      this.lastSetHoveredSpaces = Date.now();
      this.props.setHoveredSpaces(hoveredSpaces);
    }
  }

  static propTypes = {
    piece: PropTypes.array.isRequired,
    baseSize: PropTypes.number.isRequired,
    placePiece: PropTypes.func,
    boardRows: PropTypes.array,
    allowDrag: PropTypes.bool,
    style: ViewPropTypes.style,
    key: PropTypes.string,
  }
}

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

const mapStateToProps = (state) => {
  return {
    boardLocation: state.gameDisplay.boardLocation,
    pieceLocations: state.gameDisplay.pieceLocations,
  };
};

const mapDispatchToProps = {
  setHoveredSpaces,
  clearHoveredSpaces,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PieceDraggableView));
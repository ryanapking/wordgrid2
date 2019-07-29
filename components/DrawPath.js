import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

export default class DrawPath extends Component {
  constructor(props) {
    super(props);

    this._getRelativeCoordinates = this._getRelativeCoordinates.bind(this);
  }
  render() {
    const { square1, square2, boardLocation } = this.props;

    const height = boardLocation.rowHeight * .1;
    const borderRadius = height / 2;

    const p1 = this._getRelativeCoordinates(square1.rowIndex, square1.columnIndex);
    const p2 = this._getRelativeCoordinates(square2.rowIndex, square2.columnIndex);
    const angle = this._calculateAngle(p1, p2);
    const length = this._calculateLength(p1, p2) + borderRadius;
    const midpoint = this._calculateMidPoint(p1, p2);

    const style = {
      left: midpoint.x - (length / 2),
      top: midpoint.y - (height / 2),
      width: length,
      transform: [{rotate: angle + 'deg'}],
      height: height,
      borderRadius: borderRadius,
      backgroundColor: '#5283ff',
      position: 'absolute'
    };

    return (
      <View style={style} />
    );
  }

  _getRelativeCoordinates(rowIndex, columnIndex) {
    const { boardLocation } = this.props;
    const y = (rowIndex + .5) * boardLocation.rowHeight;
    const x = (columnIndex + .5) * boardLocation.columnWidth;
    return { x, y };
  }

  _calculateLength(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  _calculateMidPoint(p1, p2) {
    const x = (p1.x + p2.x) / 2;
    const y = (p1.y + p2.y) / 2;
    return {x, y};
  }

  _calculateAngle(p1, p2) {
    let dy = p1.y - p2.y;
    let dx = p1.x - p2.x;
    let theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
  }

  static propTypes = {
    square1: PropTypes.shape({
      rowIndex: PropTypes.number,
      columnIndex: PropTypes.number,
    }),
    square2: PropTypes.shape({
      rowIndex: PropTypes.number,
      columnIndex: PropTypes.number,
    }),
    boardLocation: PropTypes.shape({
      rowHeight: PropTypes.number,
      columnWidth: PropTypes.number,
    })
  };
}
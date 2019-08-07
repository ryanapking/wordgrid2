import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

const BoardDrawPath = props => {
  const { square1, square2, boardLocation } = props;

  const height = boardLocation.rowHeight * .1;
  const borderRadius = height / 2;

  const p1 = getRelativeCoordinates(boardLocation, square1.rowIndex, square1.columnIndex);
  const p2 = getRelativeCoordinates(boardLocation, square2.rowIndex, square2.columnIndex);
  const angle = calculateAngle(p1, p2);
  const length = calculateLength(p1, p2) + borderRadius;
  const midpoint = calculateMidPoint(p1, p2);

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
};

BoardDrawPath.propTypes = {
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
  }),
};

const getRelativeCoordinates = (boardLocation, rowIndex, columnIndex) => {
  const y = (rowIndex + .5) * boardLocation.rowHeight;
  const x = (columnIndex + .5) * boardLocation.columnWidth;
  return { x, y };
};

const calculateLength = (p1, p2) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};

const calculateMidPoint = (p1, p2) => {
  const x = (p1.x + p2.x) / 2;
  const y = (p1.y + p2.y) / 2;
  return {x, y};
};

const calculateAngle = (p1, p2) => {
  let dy = p1.y - p2.y;
  let dx = p1.x - p2.x;
  let theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
};

export default BoardDrawPath;
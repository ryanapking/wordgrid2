import React, { useState } from 'react';
import { View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

const MeasureView = props => {
  const [viewToMeasure, setViewToMeasure] = useState(null);

  const measure = () => {
    viewToMeasure.measure((x, y, width, height, pageX, pageY) => {
      props.onMeasure(x, y, width, height, pageX, pageY);
    });
  };

  return (
    <View
      style={props.style}
      ref={ measureView => setViewToMeasure(measureView) }
      onLayout={() => measure() }
      { ...props.panHandlers }
      pointerEvents={ props.pointerEvents ? props.pointerEvents : 'auto' }
    >
      {props.children}
    </View>
  );
};

MeasureView.propTypes = {
  onMeasure: PropTypes.func.isRequired,
  pointerEvents: PropTypes.string,
  panHandlers: PropTypes.object,
  style: ViewPropTypes.style,
};

export default MeasureView;
import React, { useRef } from 'react';
import { View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

const MeasureView = props => {
  const viewToMeasure = useRef(null);

  const measure = () => {
    viewToMeasure.current.measure((x, y, width, height, pageX, pageY) => {
      props.onMeasure(x, y, width, height, pageX, pageY);
    });
  };

  return (
    <View
      style={props.style}
      ref={viewToMeasure}
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
import React, { Component } from 'react';
import { View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

export default class MeasureView extends Component {
  render() {
    return (
      <View
        style={this.props.style}
        ref={ measureView => this.measureView = measureView }
        onLayout={() => this._onLayout() }
      >
        {this.props.children}
      </View>
    );
  }

  _onLayout() {
    this.measureView.measure((x, y, width, height, pageX, pageY) => {
      this.props.onMeasure(x, y, width, height, pageX, pageY);
    });
  }

  static propTypes = {
    onMeasure: PropTypes.func.isRequired,
    style: ViewPropTypes.style,
  }
}
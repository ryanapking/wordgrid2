import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { letterValues } from '../data/utilities';

export default class DrawLetter extends Component {
  render() {
    const { letter, letterSize } = this.props;

    if (!letter) {
      return null;
    }

    const textStyles = {
      textAlign: 'center',
      fontSize: letterSize ? letterSize * .75 : 0,
    };

    const borderSize = {
      borderWidth: letterSize ? letterSize * .015 : 0,
    };

    const valueSize = {
      fontSize: letterSize ? letterSize * .25 : 0,
      paddingBottom: letterSize ? letterSize * .025 : 1,
      paddingRight: letterSize ? letterSize * .05 : 2,
    };

    return (
      <View style={[borderSize, styles.letter, this.props.style]}>
        <Text style={textStyles}>{ letter.toUpperCase() }</Text>
        <Text style={[styles.value, valueSize]}>{ letterValues[letter] }</Text>
      </View>
    );
  }

  static propTypes = {
    letter: PropTypes.string,
    letterSize: PropTypes.number,
  }
}

const styles = StyleSheet.create({
  letter: {
    width: "100%",
    height: "100%",
    padding: '5%',
    borderColor: 'white',
    backgroundColor: "#ffd27b",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  full: {
    width: '100%',
    height: '100%'
  },
  value: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
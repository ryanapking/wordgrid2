import React, { Component } from 'react';
import { Text as RNText, View, StyleSheet, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';

export default class Text extends Component {
  render() {
    const { props } = this;

    let textStyles = [styles.text];
    if (props.centered) textStyles.push(styles.centered);
    if (props.right) textStyles.push(styles.right);
    if (props.big) textStyles.push(styles.bigText);
    if (props.small) textStyles.push(styles.smallText);
    if (props.giant) textStyles.push(styles.giantText);
    if (props.tiny) textStyles.push(styles.tinyText);
    if (props.textColor) textStyles.push({color: props.textColor});
    if (props.textStyle) textStyles.push(props.textStyle);

    let containerStyles = [styles.container];
    if (props.backgroundColor) containerStyles.push({backgroundColor: props.backgroundColor});
    if (props.noPad) containerStyles.push(styles.noPad);
    if (props.containerStyle) containerStyles.push(props.containerStyle);

    return(
      <View style={containerStyles}>
        <RNText style={textStyles}>{props.children}</RNText>
      </View>
    );
  }

  static propTypes = {
    containerStyle: ViewPropTypes.style,
    textStyle: ViewPropTypes.style,
    centered: PropTypes.bool,
    right: PropTypes.bool,
    big: PropTypes.bool,
    small: PropTypes.bool,
    giant: PropTypes.bool,
    tiny: PropTypes.bool,
    textColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    noPad: PropTypes.bool,
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  noPad: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  tinyText: {
    fontSize: 5,
  },
  smallText: {
    fontSize: 10,
  },
  text: {
    fontSize: 15,
  },
  bigText: {
    fontSize: 20,
  },
  giantText: {
    fontSize: 25,
  },
  centered: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
});
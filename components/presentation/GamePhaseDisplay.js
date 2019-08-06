import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

const GamePhaseDisplay = props => {
  const checkIcon = <Icon type='MaterialCommunityIcons' name='check' style={styles.icon} />;
  const arrowIcon = <Icon type='MaterialCommunityIcons' name='keyboard-arrow-right' style={styles.icon} />;

  let playStyles = styles.disabled;
  let placeStyles = styles.disabled;

  let playIcon = null;
  let placeIcon = null;

  switch (props.movePhase) {
    case "spell":
      playStyles = styles.enabled;
      playIcon = arrowIcon;
      break;
    case "place":
      placeStyles = styles.enabled;
      playStyles = styles.completed;
      playIcon = checkIcon;
      placeIcon = arrowIcon;
      break;
    case "confirm":
      playIcon = checkIcon;
      placeIcon = checkIcon;
      playStyles = styles.completed;
      placeStyles = styles.completed;
      break;
  }

  return (
    <View style={props.style}>
      <View style={[styles.centered]}>
        <View style={[styles.row]}>
          { playIcon }
          <Text style={playStyles}>Play Word</Text>
        </View>
        <View style={[styles.row]}>
          { placeIcon }
          <Text style={placeStyles}>Place Piece</Text>
        </View>
      </View>
    </View>
  );
};

GamePhaseDisplay.propTypes = {
  movePhase: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 15,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  row: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row'
  },
  disabled: {
    // backgroundColor: 'lightgray',
    color: 'lightgray',
  },
  enabled: {
    // backgroundColor: '#53adff'
  },
  completed: {
    // backgroundColor: '#ceff7f',
    textDecorationLine: 'line-through',
  },
  textRight: {
    textAlign: 'right',
  }
});

export default GamePhaseDisplay;
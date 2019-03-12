import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { Icon } from 'react-native-elements';

class GamePhaseDisplay extends Component {
  render() {
    const wordPlayed = !!this.props.game.word;

    const checkIcon = <Icon type='MaterialCommunityIcons' name='check' style={styles.icon} onPress={() => this.props.history.push('/')} />;
    const arrowIcon = <Icon type='MaterialCommunityIcons' name='keyboard-arrow-right' style={styles.icon} onPress={() => this.props.history.push('/')} />;

    let playStyles = styles.disabled;
    let placeStyles = styles.disabled;

    let playIcon = null;
    let placeIcon = null;

    if (!wordPlayed) {
      playStyles = styles.enabled;
      playIcon = arrowIcon;
    } else if (!this.props.game.piecePlaced) {
      placeStyles = styles.enabled;
      playStyles = styles.completed;
      playIcon = checkIcon;
      placeIcon = arrowIcon;
    } else {
      playIcon = checkIcon;
      placeIcon = checkIcon;
      playStyles = styles.completed;
      placeStyles = styles.completed;
    }

    return (
      <View style={this.props.style}>
        <View style={[styles.centered]}>
          <View style={[styles.row]}>
            { playIcon }
            <Text style={playStyles}>
              Play Word
            </Text>
          </View>
          <View style={[styles.row]}>
            { placeIcon }
            <Text style={placeStyles}>
              Place Piece
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

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

const mapStateToProps = (state, ownProps) => {
  return {
    game: state.gameData.byID[ownProps.match.params.gameID]
  };
};

export default withRouter(connect(mapStateToProps)(GamePhaseDisplay));
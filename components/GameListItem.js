import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import PropTypes from 'prop-types';

class GameListItem extends Component {
  render() {
    const { hideOpponentName, opponentName } = this.props;
    return (
      <ListItem
        title={ hideOpponentName ? this.getCTA() : opponentName }
        subtitle={ hideOpponentName ? null : this.getCTA() }
        subtitleStyle={ styles.subtitle }
        rightTitle={ this.getGameStatus() }
        rightSubtitle={ this.getScore() }
        onPress={ this.getLink() }
      />
    )
  }

  getGameStatus() {
    const { gameStatus } = this.props;
    if (gameStatus === "won:" || gameStatus === "lost:") {
      return gameStatus;
    } else {
      return "current score:";
    }
  }

  getScore() {
    const { opponentScore, playerScore } = this.props;
    return (
      <View>
        <Text style={styles.scoreLine}>you: {playerScore}</Text>
        <Text style={styles.scoreLine}>them: {opponentScore}</Text>
      </View>
    );
  }

  getCTA() {
    const { gameStatus, opponentName } = this.props;
    switch(gameStatus) {
      case "ready":
        return "Tap to make your move";
      case "won":
      case "lost":
        return "Tap to review the game";
      case "waiting":
        return `Waiting on ${opponentName}`;
    }
  }

  getLink() {
    const { gameID, gameStatus } = this.props;
    switch(gameStatus) {
      case "ready":
        return () => this.props.history.push(`/game/${gameID}`);
      case "won":
      case "lost":
        return () => this.props.history.push(`/gameReview/${gameID}`);
      case "waiting":
      default:
        return null;
    }
  }

  static propTypes = {
    gameID: PropTypes.string.isRequired,
    gameStatus: PropTypes.oneOf(['ready', 'waiting', 'won', 'lost']).isRequired,
    opponentName: PropTypes.string.isRequired,
    playerScore: PropTypes.number.isRequired,
    opponentScore: PropTypes.number.isRequired,
    hideOpponentName: PropTypes.bool,
  }
}

const styles = StyleSheet.create({
  subtitle: {
    color: 'lightgray',
  },
  scoreLine: {
    textAlign: 'right',
    color: 'lightgray',
  },
});

export default withRouter(GameListItem);
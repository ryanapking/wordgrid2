import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { respondToRequest } from "../data/parse-client/actions";
import { setErrorMessage } from "../data/redux/messages";

class GameListItem extends Component {
  constructor() {
    super();

    this.state = {
      responding: false,
    };
  }

  render() {
    const { hideOpponentName, opponentName, turn, uid, winner, gameStatus, player1 } = this.props;

    const requestFrom = gameStatus.includes('rp') ? player1 : null;

    const gameOver = !!winner;
    const gameWon = ( uid === winner );

    let calculatedGameStatus, CTA;

    if (gameOver && gameWon) {
      calculatedGameStatus = "won";
      CTA = "Tap to review the game";
    } else if (gameOver && !gameWon) {
      calculatedGameStatus = "lost";
      CTA = "Tap to review the game";
    } else if (!gameOver && uid === turn) {
      calculatedGameStatus = "ready";
      CTA = "Tap to make your move";
    } else {
      calculatedGameStatus = "waiting";
      CTA = `Waiting on ${opponentName}`;
    }

    if (requestFrom) {
      return (
        <ListItem
          title={ hideOpponentName ? CTA : opponentName }
          subtitle={ hideOpponentName ? null : CTA }
          subtitleStyle={ styles.subtitle }
          rightTitle={ requestFrom === uid ? "request pending" : this.getRequestButtons() }
          onPress={ this.getLink(calculatedGameStatus) }
        />
      );
    }

    return (
      <ListItem
        title={ hideOpponentName ? CTA : opponentName }
        subtitle={ hideOpponentName ? null : CTA }
        subtitleStyle={ styles.subtitle }
        rightTitle={ this.getGameStatus(calculatedGameStatus) }
        rightSubtitle={ this.getScore() }
        onPress={ this.getLink(calculatedGameStatus) }
        bottomDivider
      />
    )
  }

  getGameStatus(gameStatus) {
    if (gameStatus === "won" || gameStatus === "lost") {
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

  getLink(calculatedGameStatus) {
    const { gameID } = this.props;
    switch(calculatedGameStatus) {
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

  getRequestButtons() {
    if (this.state.responding) return <ActivityIndicator />;
    const { gameID } = this.props;
    return (
      <View style={styles.requestButtons}>
        <View style={styles.buttonSpacer}>
          <Button
            title="Accept"
            onPress={ () => this._respondToRequest(gameID, true) }
            color="green"
          />
        </View>
        <View>
          <Button
            title="Reject"
            onPress={ () => this._respondToRequest(gameID, false) }
            color="red"
          />
        </View>
      </View>
    );
  }

  _respondToRequest(gameID, accept) {
    this.setState({
      responding: true,
    });

    respondToRequest(gameID, accept)
      .then(() => {
        if (accept) {
          this.props.history.push(`/game/${gameID}`);
        } else {
          // dumb hack to reload current page
          const currentLocation = this.props.location;
          this.props.history.push('/');
          this.props.history.push(currentLocation);
        }
      })
      .catch( (err) => {
        this.setState({ responding: false });
        this.props.setErrorMessage(err.toString());
      });
  }

  static propTypes = {
    gameID: PropTypes.string.isRequired,
    player1: PropTypes.string.isRequired,
    gameStatus: PropTypes.string.isRequired,
    winner: PropTypes.string,
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
  requestButtons: {
    display: 'flex',
    flexDirection: 'row',
  },
  buttonSpacer: {
    marginRight: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    uid: state.user.uid,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameListItem));
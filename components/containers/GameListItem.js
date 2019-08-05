import React from 'react';
import { StyleSheet, View, Text, Button, ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import PropTypes from 'prop-types';

import { useParseAction } from "../hooks/useParseAction";
import { useHistory } from "../hooks/tempReactRouter";
import { respondToRequest } from "../../data/parse-client/actions";

const GameListItem = props => {
  const history = useHistory();
  const [respond, responsePending] = useParseAction(respondToRequest);
  const { hideOpponentName, opponentName, turn, uid, winner, gameStatus, player1 } = props;

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

  const getGameStatus = (gameStatus) => {
    if (gameStatus === "won" || gameStatus === "lost") {
      return gameStatus;
    } else {
      return "current score:";
    }
  };

  const getScore = () => {
    const { opponentScore, playerScore } = props;
    return (
      <View>
        <Text style={styles.scoreLine}>you: {playerScore}</Text>
        <Text style={styles.scoreLine}>them: {opponentScore}</Text>
      </View>
    );
  };

  const getLink = (calculatedGameStatus) => {
    const { gameID } = props;
    switch(calculatedGameStatus) {
      case "ready":
        return () => history.push(`/game/${gameID}`);
      case "won":
      case "lost":
        return () => history.push(`/gameReview/${gameID}`);
      case "waiting":
      default:
        return null;
    }
  };

  const getRequestButtons = () => {
    if (responsePending) return <ActivityIndicator />;
    const { gameID } = props;
    return (
      <View style={styles.requestButtons}>
        <View style={styles.buttonSpacer}>
          <Button
            title="Accept"
            onPress={ () => respond({gameID, accept: true}) }
            color="green"
          />
        </View>
        <View>
          <Button
            title="Reject"
            onPress={ () => respond({gameID, accept: false}) }
            color="red"
          />
        </View>
      </View>
    );
  };

  if (requestFrom) {
    return (
      <ListItem
        title={ hideOpponentName ? CTA : opponentName }
        subtitle={ hideOpponentName ? null : CTA }
        subtitleStyle={ styles.subtitle }
        rightTitle={ requestFrom === uid ? "request pending" : getRequestButtons() }
        onPress={ getLink(calculatedGameStatus) }
      />
    );
  }

  return (
    <ListItem
      title={ hideOpponentName ? CTA : opponentName }
      subtitle={ hideOpponentName ? null : CTA }
      subtitleStyle={ styles.subtitle }
      rightTitle={ getGameStatus(calculatedGameStatus) }
      rightSubtitle={ getScore() }
      onPress={ getLink(calculatedGameStatus) }
      bottomDivider
    />
  )
};

GameListItem.propTypes = {
  uid: PropTypes.string.isRequired,
  gameID: PropTypes.string.isRequired,
  player1: PropTypes.string.isRequired,
  gameStatus: PropTypes.string.isRequired,
  winner: PropTypes.string,
  opponentName: PropTypes.string.isRequired,
  playerScore: PropTypes.number.isRequired,
  opponentScore: PropTypes.number.isRequired,
  hideOpponentName: PropTypes.bool,
};

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

export default GameListItem;
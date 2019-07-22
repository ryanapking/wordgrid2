import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { getWinLossRecordAgainstOpponent } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";
import { startGame } from "../data/parse-client/actions";
import GameListItem from '../components/GameListItem';

class Friend extends Component {
  constructor() {
    super();
    this.state = {
      record: null,
      startingNewGame: false,
    }
  }

  componentDidMount() {
    const { friendID, uid } = this.props;
    getWinLossRecordAgainstOpponent(friendID, uid)
      .then((record) => {
        this.setState({ record });
      })
      .catch(() => {
        this.props.setErrorMessage("Unable to retrieve record against opponent.");
      });
  }

  _startGame() {
    this.setState({ startingNewGame: true })
    startGame(this.props.friend.id)
      .catch((err) => {
        this.props.setErrorMessage(err);
        this.setState({ startingNewGame: false })
      });
  }

  render() {
    const { gamesByID, friend, friendID } = this.props;
    const { record } = this.state;
    const gamesByIDKeys = Object.keys(gamesByID);

    if (!friend) return null;

    return (
      <View>
        <View style={ styles.topSection }>
          <Text style={ styles.friendName }>{ friend ? friend.username : "" }</Text>
          <View style={styles.recordLine}>
            <Text style={styles.recordLabel}>Wins</Text>
            <Text style={styles.recordNumber}>{ record ? record.wins : '0' }</Text>
          </View>
          <View style={styles.recordLine}>
            <Text style={styles.recordLabel}>Losses</Text>
            <Text style={styles.recordNumber}>{ record ? record.losses : '0' }</Text>
          </View>
          <View style={styles.recordLine}>
            <Text style={styles.recordLabel}>Active</Text>
            <Text style={styles.recordNumber}>{ record ? record.active : '0' }</Text>
          </View>
        </View>
        <View >
          <Button
            title={`Start a new game with ${friend.username}`}
            onPress={ () => this._startGame(friendID) }
            color="blue"
            disabled={ this.state.startingNewGame }
          />
        </View>
        {gamesByIDKeys.map((gameID) =>
          <GameListItem
            key={ gameID }
            opponentName={ friend.username }
            gameID={ gameID }
            gameStatus={ gamesByID[gameID].status }
            turn={ gamesByID[gameID].turn }
            winner={ gamesByID[gameID].winner }
            player1={ gamesByID[gameID].p1 }
            playerScore={ gamesByID[gameID].currentPlayer.score }
            opponentScore={ gamesByID[gameID].opponent.score }
            hideOpponentName
          />
        )}
        <Button
          title={`View previous games against ${friend.username}`}
          onPress={ () => this.props.history.push(`/friend/${friendID}/archive`) }
          color="blue"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topSection: {
    padding: 10,
    backgroundColor: 'lightgray',
  },
  friendName: {
    fontSize: 30,
    paddingBottom: 10,
    textAlign: 'center',
  },
  recordLine: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  recordLabel: {
    width: '50%',
    flexGrow: 1,
    textAlign: 'right',
    paddingRight: 5,
    fontSize: 20,
  },
  recordNumber: {
    width: '50%',
    flexGrow: 1,
    paddingLeft: 5,
    fontSize: 20,
  }
});

const mapStateToProps = (state, ownProps) => {
  const friendID = ownProps.match.params.friendID;
  const friend = state.user.friendsByID[friendID];
  const { byID } = state.gameData;
  const gamesByID = {};
  for ( let gameID in byID) {
    const game = byID[gameID];
    if (game.p1 === friendID || game.p2 === friendID) {
      gamesByID[gameID] = game;
    }
  }
  return {
    gamesByID,
    friendID,
    friend,
    uid: state.user.uid,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Friend));
import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Button } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from "react-native-elements";

import { GAME_STATES } from "../data/utilities/constants";
import StartGameOverlay from '../components/StartGameOverlay';
import GameListItem from '../components/GameListItem';

class Games extends Component {

  render() {
    const { byID: gamesByID } = this.props.gameData;

    let readyToPlay = [];
    let waitingOnOpponent = [];
    let over = [];
    let requests = [];

    Object.keys(gamesByID).forEach( (gameID) => {
      const game = gamesByID[gameID];

      if ((game.status === GAME_STATES.REQUEST_PENDING_NEW || game.status === GAME_STATES.REQUEST_PENDING) && this.props.userID === game.p2) {
        requests.push(gameID);
      } else if (game.turn === this.props.userID && !game.winner) {
        readyToPlay.push(gameID);
      } else if ( game.turn === null || (game.turn !== this.props.userID && !game.winner) ) {
        waitingOnOpponent.push(gameID);
      } else if ( game.winner ) {
        over.push(gameID);
      }
    });

    return (
      <ScrollView style={{width: '100%'}}>
        <ListItem title="Daily Challenge" onPress={() => this.props.history.push(`/challenges`)} />
        {requests.length > 0 &&
          <View>
            <ListItem title="New Game Requests:" containerStyle={styles.divider} />
            { requests.map( (gameID) => this.getGameListItem(gameID))}
          </View>
        }
        {readyToPlay.length > 0 &&
          <View>
            <ListItem title="Ready to Play:" containerStyle={styles.divider} />
            { readyToPlay.map( (gameID) => this.getGameListItem(gameID))}
          </View>
        }
        <StartGameOverlay />
        {waitingOnOpponent.length > 0 &&
          <View>
            <ListItem title="Opponent's Move:" containerStyle={styles.divider} />
            { waitingOnOpponent.map( (gameID) => this.getGameListItem(gameID))}
          </View>
        }
        {over.length > 0 &&
          <View>
            <ListItem title="Ended:" containerStyle={styles.divider} />
            { over.map( (gameID) => this.getGameListItem(gameID))}
          </View>
        }
        <Button
          title="View Archived Games"
          onPress={ () => this.props.history.push('/games/archive') }
        />
      </ScrollView>
    );
  }

  getGameListItem(gameID) {
    const game = this.props.gameData.byID[gameID];
    return (
      <GameListItem
        key={ gameID }
        opponentName={ game.opponent.name }
        gameID={ gameID }
        gameStatus={ game.status }
        turn={ game.turn }
        winner={ game.winner }
        player1={ game.p1 }
        playerScore={ game.currentPlayer.score }
        opponentScore={ game.opponent.score }
      />
    );
  }

}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: 'lightgray',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.uid,
    gameData: state.gameData,
  };
};

export default withRouter(connect(mapStateToProps)(Games));
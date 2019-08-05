import React from 'react';
import { View, ScrollView, StyleSheet, Button } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';
import { ListItem } from "react-native-elements";

import { useHistory } from "../components/hooks/tempReactRouter";
import { GAME_STATES } from "../data/utilities/constants";
import StartGameOverlay from '../components/presentation/StartGameOverlay';
import GameListItem from '../components/presentation/GameListItem';

const Games = () => {
  const history = useHistory();
  const userID = useSelector(state => state.user.uid, shallowEqual);
  const gameData = useSelector(state => state.gameData, shallowEqual);
  const { byID: gamesByID } = gameData;

  let readyToPlay = [];
  let waitingOnOpponent = [];
  let over = [];
  let requests = [];

  Object.keys(gamesByID).forEach( (gameID) => {
    const game = gamesByID[gameID];

    if ((game.status === GAME_STATES.REQUEST_PENDING_NEW || game.status === GAME_STATES.REQUEST_PENDING) && userID === game.p2) {
      requests.push(gameID);
    } else if (game.turn === userID && !game.winner) {
      readyToPlay.push(gameID);
    } else if ( game.turn === null || (game.turn !== userID && !game.winner) ) {
      waitingOnOpponent.push(gameID);
    } else if ( game.winner ) {
      over.push(gameID);
    }
  });

  const getGameListItem = (gameID) => {
    const game = gamesByID[gameID];
    return (
      <GameListItem
        key={ gameID }
        uid={ userID }
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
  };

  return (
    <ScrollView style={{width: '100%'}}>
      <ListItem title="Daily Challenge" onPress={() => history.push(`/challenges`)} />
      {requests.length > 0 &&
      <View>
        <ListItem title="New Game Requests:" containerStyle={styles.divider} />
        { requests.map( (gameID) => getGameListItem(gameID))}
      </View>
      }
      {readyToPlay.length > 0 &&
      <View>
        <ListItem title="Ready to Play:" containerStyle={styles.divider} />
        { readyToPlay.map( (gameID) => getGameListItem(gameID))}
      </View>
      }
      <StartGameOverlay />
      {waitingOnOpponent.length > 0 &&
      <View>
        <ListItem title="Opponent's Move:" containerStyle={styles.divider} />
        { waitingOnOpponent.map( (gameID) => getGameListItem(gameID))}
      </View>
      }
      {over.length > 0 &&
      <View>
        <ListItem title="Ended:" containerStyle={styles.divider} />
        { over.map( (gameID) => getGameListItem(gameID))}
      </View>
      }
      <Button
        title="View Archived Games"
        onPress={ () => history.push('/games/archive') }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: 'lightgray',
  },
});

export default Games;
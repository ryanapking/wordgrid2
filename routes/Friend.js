import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';

import { useAsyncFetcher } from "../hooks/useAsyncFetcher";
import { useParseAction } from "../hooks/useParseAction";
import { useParams, useHistory } from "../hooks/tempReactRouter";
import { getWinLossRecordAgainstOpponent } from "../data/parse-client/getters";
import { startGame as parseStartGame } from "../data/parse-client/actions";
import GameListItem from '../components/GameListItem';

const Friend = () => {
  const history = useHistory();
  const params = useParams();
  const { friendID } = params;

  const [uid, friend, gamesByID] = useSelector(
    state => {
      return [
        state.user.uid,
        state.user.friendsByID[friendID],
        state.gameData.byID
      ]
    },
    shallowEqual,
  );

  // filter to get only the active games vs current friend
  const gamesVsFriend = useMemo(() => {
    if (!gamesByID) return [];
    const gamesVsFriend = [];
    for ( let gameID in gamesByID) {
      const game = gamesByID[gameID];
      if (game.p1 === friendID || game.p2 === friendID) {
        gamesVsFriend.push(game);
      }
    }
    return gamesVsFriend;
  }, [gamesByID, friendID]);

  const [record] = useAsyncFetcher(
    getWinLossRecordAgainstOpponent,
    {opponentId: friendID, currentPlayerId: uid},
  );

  const [startGame, startGamePending] = useParseAction(parseStartGame);

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
          onPress={ () => startGame({opponentID: friendID}) }
          color="blue"
          disabled={ startGamePending }
        />
      </View>
      {gamesVsFriend.map((game) =>
        <GameListItem
          key={ game.sourceData.objectId }
          uid={ uid }
          opponentName={ friend.username }
          gameID={ game.sourceData.objectId }
          gameStatus={ game.status }
          turn={ game.turn }
          winner={ game.winner }
          player1={ game.p1 }
          playerScore={ game.currentPlayer.score }
          opponentScore={ game.opponent.score }
          hideOpponentName
        />
      )}
      <Button
        title={`View previous games against ${friend.username}`}
        onPress={ () => history.push(`/friend/${friendID}/archive`) }
        color="blue"
      />
    </View>
  );
};

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

export default Friend;
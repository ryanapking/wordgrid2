import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';

import { useParams } from "../hooks/tempReactRouter";
import { getOpponentArchive } from "../data/parse-client/getters";
import { remoteToLocal } from "../data/utilities/functions/dataConversions";
import { useAsyncFetcher } from "../hooks/useAsyncFetcher";
import GameListItem from '../components/GameListItem';

const FriendArchive = () => {
  const params = useParams();
  const { friendID } = params;
  const [uid, friend] = useSelector(state => [state.user.uid, state.user.friendsByID[friendID]], shallowEqual);
  const [gamesSource] = useAsyncFetcher(getOpponentArchive, {opponentId: friendID, currentPlayerId: uid}, true);

  // convert source data to something we can display
  const games = useMemo(() => {
    if (!gamesSource) return [];
    return gamesSource.map((gameSource) => {
      return remoteToLocal(gameSource, uid);
    });
  }, [gamesSource, uid]);

  return (
    <View>
      <Text>FriendArchive.js</Text>
      <Text>{ friendID }</Text>
      <Text>{ friend ? friend.username : '' }</Text>
      <FlatList
        data={games}
        renderItem={({item: game}) =>
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
        }
      />
    </View>
  );
};

export default FriendArchive;
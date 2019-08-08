import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';

import { useAsyncFetcher } from "../hooks/useAsyncFetcher";
import { remoteToLocal } from "../data/utilities/functions/dataConversions";
import { getFullGameArchive } from "../data/parse-client/getters";
import GameListItem from "../components/GameListItem";

// TODO: paginate
// TODO: pull from remote instead of local

const GameArchive = () => {
  const uid = useSelector(state => state.user.uid, shallowEqual);
  const [gamesSource] = useAsyncFetcher(getFullGameArchive, {playerID: uid});

  // convert games source data to something we can display
  const games = useMemo(() => {
    if (!gamesSource) return [];
    return gamesSource.map(gameSource => remoteToLocal(gameSource, uid));
  }, [gamesSource, uid]);

  return (
    <FlatList
      data={games}
      keyExtractor={ (item) => item.sourceData.objectId }
      renderItem={ ({item: game}) =>
        <GameListItem
          key={ game.sourceData.objectId }
          uid={ uid }
          opponentName={ game.opponent.name }
          gameID={ game.sourceData.objectId }
          gameStatus={ game.status }
          turn={ game.turn }
          winner={ game.winner }
          player1={ game.p1 }
          playerScore={ game.currentPlayer.score }
          opponentScore={ game.opponent.score }
        />
      }
    />
  );
};

export default GameArchive;
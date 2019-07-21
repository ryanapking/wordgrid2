import moment from 'moment';

import Parse from './client-setup';
import { challengeRemoteToLocalStorageObject } from '../utilities/functions/dataConversions';

export async function getUpcomingChallengesByDate() {
  const ChallengesObject = Parse.Object.extend("Challenges");

  let upcomingChallenges = await new Parse.Query(ChallengesObject)
    .equalTo("challengeComplete", false)
    .find();

  let challengesByDate = {};
  upcomingChallenges.forEach( (challenge) => {

    const date = moment(challenge.get("startDate")).format("M-D-YYYY");

    const challengeLocalStorageObject = challengeRemoteToLocalStorageObject(challenge, date);
    challengesByDate[challengeLocalStorageObject.date] = challengeLocalStorageObject;
  });

  console.log('upcoming challenges by date:', challengesByDate);

  return challengesByDate;
}

export async function getUsersByPartialString(searchString, excludeID) {
  if (searchString.length < 3) return [];

  return await new Parse.Query(Parse.User)
    .exists('email')
    .startsWith('username', searchString)
    .notEqualTo('objectId', excludeID)
    .limit(10)
    .find()
    .catch( (err) => {
      throw new Error(err);
    });
}

export async function getFriendsByID(friendIDs = []) {
  const myFriends = await new Parse.Query(Parse.User)
    .containedIn("objectId", friendIDs)
    .find()
    .catch((err) => {
      throw new Error(err);
    });

  if (!myFriends) return [];

  return myFriends.map((friend) => {
    return {
      username: friend.get('username'),
      id: friend.id,
    }
  });
}

export async function updatePinsAgainstOpponent(opponentId, currentPlayerId) {
  console.log('updatePinsAgainstOpponent()');

  const GamesObject = Parse.Object.extend("Games");
  const playerPointers = [
    {
      __type: 'Pointer',
      className: '_User',
      objectId: opponentId,
    },
    {
      __type: 'Pointer',
      className: '_User',
      objectId: currentPlayerId,
    }
  ];

  // query local data store for games against opponent
  const pinnedGames = await new Parse.Query(GamesObject)
    .fromLocalDatastore()
    .containedIn('player1', playerPointers)
    .containedIn('player2', playerPointers)
    .find()
    .catch((err) => {
      throw new Error(err);
    });

  console.log('pinned games:', pinnedGames);

  // format local query into arrays of IDs for remote comparison
  let pinnedGamesIds = [];
  let unarchivedGameIds = [];

  if (pinnedGames) {
    pinnedGamesIds = pinnedGames
      .map((game) => {
        return game.id;
      });

    unarchivedGameIds = pinnedGames
      .filter((game) => {
        return !game.get('archived');
      })
      .map((game) => {
        return game.id;
      });
  }

  console.log('pinned game IDs:', pinnedGamesIds);
  console.log('unarchived game IDs:', unarchivedGameIds);

  // check remote for any games not stored locally
  const unpinnedQuery = new Parse.Query(GamesObject)
    .containedIn('player1', playerPointers)
    .containedIn('player2', playerPointers)
    .notContainedIn('objectId', pinnedGamesIds);

  // check remote for any games still pending
  const unarchivedQuery = new Parse.Query(GamesObject)
    .containedIn('objectId', unarchivedGameIds);

  // combine above queries and fetch
  const gamesToPin = await new Parse.Query.or(unpinnedQuery, unarchivedQuery)
    .find()
    .catch((err) => {
      throw new Error(err);
    });

  console.log('games to pin:', gamesToPin);

  // pin the missing games
  if (gamesToPin) {
    Parse.Object.pinAll(gamesToPin)
      .catch((err) => {
        throw new Error(err);
      });
  }

  console.log('missing games pinned');

  return gamesToPin;
}

export async function getGamesAgainstOpponent(opponentId, currentPlayerId, active = true, offset = 0, fromLocalDatastore = false) {
  const GamesObject = Parse.Object.extend("Games");

  const playerPointers = [
    {
      __type: 'Pointer',
      className: '_User',
      objectId: opponentId,
    },
    {
      __type: 'Pointer',
      className: '_User',
      objectId: currentPlayerId,
    }
  ];

  const query = new Parse.Query(GamesObject)
    .containedIn('player1', playerPointers)
    .containedIn('player2', playerPointers)
    .limit(10)
    .skip(offset);

  // returns either active games or inactive games
  if (active) query.doesNotExist('winner');
  else query.exists('winner');

  if (fromLocalDatastore) query.fromLocalDatastore();

  const foundGames = await query.find()
    .catch((err) => {
      throw new Error(err);
    });

  if (!foundGames) return [];

  return foundGames.map((game) => {
    return game.toJSON();
  });
}

export async function getWinLossRecordAgainstOpponent(opponentId, currentPlayerId) {
  const GamesObject = Parse.Object.extend("Games");

  const currentPlayerPointer = {
    __type: 'Pointer',
    className: '_User',
    objectId: currentPlayerId,
  };

  const opponentPointer = {
    __type: 'Pointer',
    className: '_User',
    objectId: opponentId,
  };

  const playerPointers = [opponentPointer, currentPlayerPointer];

  const wins = await new Parse.Query(GamesObject)
    .containedIn('player1', playerPointers)
    .containedIn('player2', playerPointers)
    .equalTo('winner', currentPlayerPointer)
    .count()
    .catch((err) => {
      throw new Error(err);
    });

  const losses = await new Parse.Query(GamesObject)
    .containedIn('player1', playerPointers)
    .containedIn('player2', playerPointers)
    .equalTo('winner', opponentPointer)
    .count()
    .catch((err) => {
      throw new Error(err);
    });

  const active = await new Parse.Query(GamesObject)
    .containedIn('player1', playerPointers)
    .containedIn('player2', playerPointers)
    .doesNotExist('winner')
    .count()
    .catch((err) => {
      throw new Error(err);
    });

  const total = wins + losses + active;

  return { wins, losses, active, total };
}

// attempts to pull data from Parse local data store
// falls back to pulling from remote
export async function getGameSourceData(gameID) {

  const GamesObject = Parse.Object.extend("Games");

  // try to fetch the game from the local datastore
  let game = await new Parse.Query(GamesObject)
    .fromLocalDatastore()
    .get(gameID)
    .catch((err) => {
      // This error isn't a big issue. The game is probably not pinned by Parse, so we need to get the game from the parse server.
      console.log('error getting game from local data store:', err);
    });

  // if the local data store fetch failed, fetch the game remote
  if (!game) {
    game = await new Parse.Query(GameObject)
      .get(gameID)
      .catch((err) => {
        throw new Error("Error getting the game data.");
      });

    // I don't particularly care if pins fail.
    game.pin().catch();
  }

  return game.toJSON();
}
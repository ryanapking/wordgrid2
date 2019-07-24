import moment from 'moment';

import Parse from './client-setup';
import { challengeRemoteToLocalStorageObject } from '../utilities/functions/dataConversions';

const ChallengesObject = Parse.Object.extend("Challenges");
const GamesObject = Parse.Object.extend("Games");
const ChallengeAttemptObject = Parse.Object.extend("ChallengeAttempt");

export async function getUpcomingChallengesByDate() {

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

// searches local data store for current challenge
// if not found, searches remote db and pins challenge to local data store
export async function getCurrentChallenge() {
  const now = moment().toDate();
  const localChallenge = await new Parse.Query(ChallengesObject)
    .greaterThan("endDate", now)
    .lessThan("startDate", now)
    .limit(1)
    .fromLocalDatastore()
    .find()
    .catch((err) => {
      console.log('error fetching current challenge from local data store', err);
      throw new Error(err);
    });

  if (localChallenge.length) {
    return localChallenge[0].toJSON();
  }

  const remoteChallenge = await new Parse.Query(ChallengesObject)
    .greaterThan('endDate', now)
    .lessThan('startDate', now)
    .limit(1)
    .find()
    .catch((err) => {
      console.log('error fetching current challenge from parse', err);
      throw new Error(err);
    });

  Parse.Object.pinAll(remoteChallenge)
    .then(() => {
      console.log('current challenge pinned');
    })
    .catch((err) => {
      console.log('error pinning current challenge', err);
    });

  if (remoteChallenge) {
    return remoteChallenge[0].toJSON();
  }

  throw new Error('No challenge found!');
}

// yields 1 to 2 values:
// 1: recent challenges from local data store
// 2: if needed, pulls from remote and yields
export async function* getRecentChallenges(skipDays = 0) {

  // count back 10 days from now, skipping any needed days
  // we never want the current challenge, so we add one to skipDays
  const startingPoint = moment().subtract(skipDays + 1, 'day');
  const latest = startingPoint.toDate();
  const earliest = startingPoint.subtract(10, 'day').toDate();

  // query against local data store
  const localChallenges = await new Parse.Query(ChallengesObject)
    .greaterThan("startDate", earliest)
    .lessThan("startDate", latest)
    .descending("startDate")
    .include(['winners', 'winners.user'])
    .fromLocalDatastore()
    .find()
    .catch((err) => {
      console.log('error fetching challenges from local')
      throw new Error(err);
    });

  // yield challenges from local data store
  yield localChallenges.map((challenge) => {
    return challenge.toJSON();
  });

  // determine if we need to fetch remote
  let needsFetch = false;
  // TODO: there will be a point in time when this will not return 10 challenges
  if (localChallenges.length < 10) needsFetch = true;
  if (!needsFetch) {
    localChallenges.forEach((challenge) => {
      const finalRankingComplete = challenge.get('finalRankingComplete');
      if (!finalRankingComplete) needsFetch = true;
    });
  }

  // exit if no fetch needed
  if (!needsFetch) return;

  // run same query as above against remote db
  const remoteChallenges = await new Parse.Query(ChallengesObject)
    .greaterThan("startDate", earliest)
    .lessThan("startDate", latest)
    .descending("startDate")
    .include(['winners', 'winners.user'])
    .find()
    .catch((err) => {
      console.log('error fetching challenges from remote')
      throw new Error(err);
    });

  // pin values to local data store
  Parse.Object.pinAll(remoteChallenges)
    .then(() => {
      console.log('remote challenges pinned');
    })
    .catch((err) => {
      console.log('error pinning challenges', err);
    });

  // yield challenges from remote
  yield remoteChallenges.map((challenge) => {
    return challenge.toJSON();
  });
}

export async function getChallengeByID(challengeID) {
  const localChallenge = await new Parse.Query(ChallengesObject)
    .fromLocalDatastore()
    .include(['winners', 'winners.user'])
    .get(challengeID)
    .catch((err) => {
      console.log('error fetching challenge by ID from local data store', err);
      throw new Error(err);
    });

  if (localChallenge) {
    return localChallenge.toJSON();
  }

  const remoteChallenge = await new Parse.Query(ChallengesObject)
    .include(['winners', 'winners.user'])
    .get(challengeID)
    .catch((err) => {
      console.log('error fetching challenge by ID from remote store', err);
      throw new Error(err);
    });

  if (remoteChallenge) {
    return remoteChallenge.toJSON();
  }

  throw new Error('challenge not found');
}

// TODO: this should probably be a generator function that returns 1 to 2 values
export async function getAttemptByChallengeID(challengeID, uid) {

  // pointers for query comparisons
  const challengePointer = {
    __type: 'Pointer',
    className: 'Challenges',
    objectId: challengeID,
  };
  const userPointer = {
    __type: 'Pointer',
    className: '_User',
    objectId: uid,
  };

  // query local data store
  const localAttempts = await new Parse.Query(ChallengeAttemptObject)
    .fromLocalDatastore()
    .equalTo("user", userPointer)
    .equalTo("challenge", challengePointer)
    .limit(1)
    .find()
    .catch((err) => {
      console.log('error getting attempt from local data store', err);
      throw new Error(err);
    });

  // if we have a local attempt and it doesn't need to be updated, return it
  let attempt;
  if (localAttempts.length) {
    attempt = localAttempts[0].toJSON();
    if (attempt.challengeComplete) {
      return attempt;
    }
  }

  // query remote
  const remoteAttempts = await new Parse.Query(ChallengeAttemptObject)
    .equalTo("user", userPointer)
    .equalTo("challenge", challengePointer)
    .limit(1)
    .find()
    .catch((err) => {
      console.log('error getting attempt from local data store', err);
      return []; // no need to trigger error, just return empty
    });

  // pin and return remote values
  if (remoteAttempts.length) {
    Parse.Object.pinAll(remoteAttempts)
      .then((something) => {
        console.log('remote challenge attempt pinned successfully', something);
      })
      .catch((err) => {
        console.log('error pinning remote challenge attempt:', err);
      });
    return remoteAttempts[0].toJSON();
  }

  // if remote returned nothing, fall back to returning local attempt, if it exists
  if (attempt) return attempt;

  throw new Error("Unable to find challenge attempt");
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

export async function updatePinsAgainstOpponent(opponentId, currentPlayerId) {
  console.log('updatePinsAgainstOpponent()');

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

export async function getOpponentArchive(opponentId, currentPlayerId) {

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

  const archive = await new Parse.Query(GamesObject)
    .fromLocalDatastore()
    .containedIn('player1', playerPointers)
    .containedIn('player2', playerPointers)
    .exists('winner')
    .find()
    .catch((err) => {
      throw new Error(err);
    });

  console.log('found archive:', archive);

  if (!archive) return [];

  return archive.map((game) => {
    return game.toJSON();
  });
}

export async function getFullGameArchive(playerID) {
  const currentPlayerPointer = {
    __type: 'Pointer',
    className: '_User',
    objectId: playerID,
  };

  console.log('player id:', playerID);

  const p1Query = new Parse.Query(GamesObject)
    .equalTo('player1', currentPlayerPointer)
    .equalTo('archived', true);

  const p2Query = new Parse.Query(GamesObject)
    .equalTo('player2', currentPlayerPointer)
    .equalTo('archived', true);

  const archive = await new Parse.Query.or(p1Query, p2Query)
    .fromLocalDatastore()
    .find()
    .catch((err) => {
      throw new Error(err);
    });

  if (!archive) return [];

  return archive.map((game) => {
    return game.toJSON();
  });
}

export async function getWinLossRecordAgainstOpponent(opponentId, currentPlayerId) {

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
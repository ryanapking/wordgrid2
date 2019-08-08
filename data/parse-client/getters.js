import moment from 'moment';

import Parse from './client-setup';

const ChallengesObject = Parse.Object.extend("Challenges", {}, {});
const GamesObject = Parse.Object.extend("Games", {}, {});
const ChallengeAttemptObject = Parse.Object.extend("ChallengeAttempt", {}, {});

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
      console.log('error fetching challenges from local');
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
      console.log('error fetching challenges from remote');
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
    const remoteJSON = challenge.toJSON();
    return challenge.toJSON();
  });
}

/**
 * Returns a Challenge from Parse based on ID
 *
 * @param {Object} obj
 * @param {string} obj.challengeID
 * @returns {Promise<Array|any>}
 */
export async function getChallengeByID({challengeID}) {
  // get challenge from local data store
  const localChallenge = await new Parse.Query(ChallengesObject)
    .fromLocalDatastore()
    .include(['winners', 'winners.user'])
    .get(challengeID)
    .catch((err) => {
      console.log('error fetching challenge by ID from local data store', err);
    });

  // if the local object is the finished version, return it
  if (localChallenge && localChallenge.get('finalRankingComplete')) {
    return localChallenge.toJSON();
  }

  // get challenge from remote
  const remoteChallenge = await new Parse.Query(ChallengesObject)
    .include(['winners', 'winners.user'])
    .get(challengeID)
    .catch((err) => {
      console.log('error fetching challenge by ID from remote store', err);
    });

  if (remoteChallenge) {
    remoteChallenge.pin()
      .then(() => {
        console.log('remote challenge pinned')
      })
      .catch((err) => {
        console.log('remote challenge pin error:', err);
      });
    return remoteChallenge.toJSON();
  }

  // fall back to the local object if it exists
  if (localChallenge) {
    return localChallenge.toJSON();
  }

  throw new Error('challenge not found');
}

export async function getAttemptByID(attemptID) {
  // get attempt from local data store
  const localAttempt = await new Parse.Query(ChallengeAttemptObject)
    .fromLocalDatastore()
    .include(['user', 'challenge'])
    .get(attemptID)
    .catch((err) => {
      console.log('error fetching attempt by ID from local data store', err);
    });

  // if the local object is the finished version, return it
  if (localAttempt && localAttempt.get('challengeComplete')) {
    return localAttempt.toJSON();
  }

  // get attempt from remote
  const remoteAttempt = await new Parse.Query(ChallengeAttemptObject)
    .include(['user', 'challenge'])
    .get(attemptID)
    .catch((err) => {
      console.log('error fetching attempt by ID from remote store', err);
    });

  // if we have the attempt, pin it and return
  if (remoteAttempt) {
    remoteAttempt.pin()
      .then(() => {
        console.log('remote attempt pinned')
      })
      .catch((err) => {
        console.log('remote attempt pin error:', err);
      });
    return remoteAttempt.toJSON();
  }

  // fall back to the local object if it exists
  if (localAttempt) {
    return localAttempt.toJSON();
  }

  throw new Error('attempt not found');
}

// TODO: this should probably be a generator function that returns 1 to 2 values
export async function getAttemptByChallengeID({challengeID, uid}) {

  // pointers for query comparisons
  const challengePointer = new ChallengesObject().set('id', challengeID, {});
  const userPointer = new Parse.User().set('id', uid, {});

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
    /** @namespace result.challengeComplete **/
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

/**
 * Searches for users by username
 *
 * @param {Object} obj
 * @param {string} obj.searchString
 * @param {string} obj.currentUserID
 * @returns {Promise<Array|any>}
 */
export async function getUsersByPartialString({searchString, currentUserID}) {
  if (searchString.length < 3) return [];

  const results =  await new Parse.Query(Parse.User)
    .exists('email')
    .startsWith('username', searchString)
    .notEqualTo('objectId', currentUserID)
    .limit(10)
    .find()
    .catch( (err) => {
      throw new Error(err);
    });

  return results.map((user) => {
    return user.toJSON();
  });
}

export async function updatePinsAgainstOpponent(opponentId, currentPlayerId) {
  console.log('updatePinsAgainstOpponent()');

  const playerPointers = [
    new Parse.User().set('id', opponentId, {}),
    new Parse.User().set('id', currentPlayerId, {}),
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
    new Parse.User().set('id', opponentId, {}),
    new Parse.User().set('id', currentPlayerId, {}),
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
  const currentPlayerPointer = new Parse.User().set('id', playerID, {});

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

  const currentPlayerPointer = new Parse.User().set('id', currentPlayerId, {});
  const opponentPointer = new Parse.User().set('id', opponentId, {});
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
    game = await new Parse.Query(GamesObject)
      .get(gameID, {})
      .catch((err) => {
        console.log('error getting game data:', err);
        throw new Error("Error getting the game data.");
      });

    // I don't particularly care if pins fail.
    game.pin().catch();
  }

  return game.toJSON();
}
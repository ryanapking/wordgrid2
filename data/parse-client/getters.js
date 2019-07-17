import moment from 'moment';

import Parse from './client-setup';
import { challengeRemoteToLocalStorageObject } from '../utilities/functions/dataConversions';

export async function getUpcomingChallengesByDate() {
  let now = moment().toDate();

  const ChallengesObject = Parse.Object.extend("Challenges");

  let upcomingChallenges = await new Parse.Query(ChallengesObject)
    .greaterThanOrEqualTo("endDate", now)
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

export async function getGamesAgainstOpponent(opponentId, currentPlayerId, active = true, offset = 0) {
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
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

export async function getGamesAgainstOpponent(opponentId, currentPlayerId) {
  const GamesObject = Parse.Object.extend("Games");

  const opponentPointer = {
    __type: 'Pointer',
    className: '_User',
    objectId: opponentId,
  };

  const currentPlayerPointer = {
    __type: 'Pointer',
    className: '_User',
    objectId: currentPlayerId,
  };

  const opponentP1Games = new Parse.Query(GamesObject).equalTo("player1", opponentPointer);
  const opponentP2Games = new Parse.Query(GamesObject).equalTo("player2", opponentPointer);
  const opponentQuery = new Parse.Query.or(opponentP1Games, opponentP2Games).include('*');

  const currentPlayerP1Games = new Parse.Query(GamesObject).equalTo("player1", currentPlayerPointer);
  const currentPlayerP2Games = new Parse.Query(GamesObject).equalTo("player2", currentPlayerPointer);
  const currentPlayerQuery = new Parse.Query.or(currentPlayerP1Games, currentPlayerP2Games);

  const foundGames = await new Parse.Query
    .and(currentPlayerQuery, opponentQuery)
    .find()
    .catch((err) => {
      throw new Error(err);
    });

  if (!foundGames) return [];

  return foundGames.map((game) => {
    return game.toJSON();
  });
}
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
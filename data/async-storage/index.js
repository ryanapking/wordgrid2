import { AsyncStorage } from 'react-native';

import { store } from '../../App';
import { setAttemptsHistory } from '../redux/challengeData';

const prefix = "userChallenge:";

// structure:
const userTemplate = {
  challengeIDs: [], // array of challenge IDs (timestamp generated at daily challenge creation)
  challengeDataByID: {}, // object containing challenge starting point
  challengeAttemptsByID: {}, // user challenge attempts
};

export function storeChallengeAttempt(uid, challengeData, challengeAttempt) {

  const strippedChallengeAttempt = {
    history: challengeAttempt.history,
    score: challengeAttempt.score,
  };

  const challengeID = String(challengeAttempt.id);

  AsyncStorage.getItem(prefix + uid, (error, result) => {
    // parse the results if they exist, use above template if they don't
    let userChallengeData = result ? JSON.parse(result) : {...userTemplate};
    let { challengeIDs, challengeDataByID, challengeAttemptsByID } = userChallengeData;

    // create the keys if needed
    if (!challengeIDs.includes(challengeID)) challengeIDs.push(challengeID);
    if (!(challengeID in challengeDataByID)) challengeDataByID[challengeID] = challengeData;
    if (!(challengeID in challengeAttemptsByID)) challengeAttemptsByID[challengeID] = [];

    // add the challenge attempt
    challengeAttemptsByID[challengeID].push(strippedChallengeAttempt);

    let setValue = {
      challengeIDs,
      challengeDataByID,
      challengeAttemptsByID,
    };
    setValue = purgeOldAttempts(setValue);

    AsyncStorage.setItem(prefix + uid, JSON.stringify(setValue));
  });
}

function purgeOldAttempts(userChallengeData) {
  let { challengeIDs, challengeDataByID, challengeAttemptsByID } = userChallengeData;

  challengeIDs = challengeIDs.sort().slice(-10);

  Object.keys(challengeDataByID).forEach( (key) => {
    if (!challengeIDs.includes(key)) delete challengeDataByID[key];
  });

  Object.keys(challengeAttemptsByID).forEach( (key) => {
    if (!challengeIDs.includes(key)) delete challengeAttemptsByID[key];
  });

  return {
    challengeIDs,
    challengeDataByID,
    challengeAttemptsByID,
  };
}

export function retrieveChallengeAttempts(uid) {
  return new Promise( (resolve, reject) => {
    AsyncStorage.getItem(prefix + uid)
      .then( (result) => {
        resolve(JSON.parse(result));
      })
      .catch( (err) => {
        reject(err);
      });
  });
}

export function clearUserData(uid) {
  AsyncStorage.removeItem(prefix + uid);
}
import { AsyncStorage } from 'react-native';

import { store } from '../../App';
import { setAttemptsHistory } from '../redux/challengeData';

const prefix = "userChallenge:";

// structure:
const userTemplate = {
  challengeIDs: [], // array of challenge IDs (timestamp generated at daily challenge creation)
  challengesByID: {}, // object containing challenge starting point
  attemptsByID: {}, // user challenge attempts
};

export function storeChallengeAttempt(uid, challengeData, challengeAttempt) {
  return new Promise( (resolve) => {

    const strippedChallengeAttempt = {
      history: challengeAttempt.history,
      score: challengeAttempt.score,
    };

    const challengeID = String(challengeAttempt.id);

    AsyncStorage.getItem(prefix + uid, (error, result) => {
      // parse the results if they exist, use above template if they don't
      let userChallengeData = result ? JSON.parse(result) : {...userTemplate};
      let { challengeIDs, challengesByID, attemptsByID } = userChallengeData;

      // create the keys if needed
      if (!challengeIDs.includes(challengeID)) challengeIDs.push(challengeID);
      if (!(challengeID in challengesByID)) challengesByID[challengeID] = challengeData;
      if (!(challengeID in attemptsByID)) attemptsByID[challengeID] = [];

      // add the challenge attempt
      attemptsByID[challengeID].push(strippedChallengeAttempt);

      let setValue = {
        challengeIDs,
        challengesByID,
        attemptsByID,
      };
      setValue = purgeOldAttempts({...setValue});

      resolve(setValue);
      AsyncStorage.setItem(prefix + uid, JSON.stringify(setValue));
    });

  });
}

function purgeOldAttempts(userChallengeData) {
  let { challengeIDs, challengesByID, attemptsByID } = userChallengeData;

  challengeIDs = challengeIDs.sort().slice(-10);

  Object.keys(challengesByID).forEach( (key) => {
    if (!challengeIDs.includes(key)) delete challengesByID[key];
  });

  Object.keys(attemptsByID).forEach( (key) => {
    if (!challengeIDs.includes(key)) delete attemptsByID[key];
  });

  return {
    challengeIDs,
    challengesByID,
    attemptsByID,
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
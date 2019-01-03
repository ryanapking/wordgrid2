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
  const challengeID = challengeData.ID;

  AsyncStorage.getItem(prefix + uid, (error, result) => {
    // parse the results if they exist, use above template if they don't
    let userChallengeData = result ? JSON.parse(result) : {...userTemplate};
    let { challengeIDs, challengeDataByID, challengeAttemptsByID } = userChallengeData;

    // create the keys if needed
    if (!challengeIDs.includes(challengeID)) challengeIDs.push(challengeID);
    if (!Object.keys(challengeDataByID).includes(challengeID)) challengeDataByID[challengeID] = challengeData;
    if (!Object.keys(challengeAttemptsByID).includes(challengeID)) challengeAttemptsByID[challengeID] = [];

    // add the challenge attempt
    challengeAttemptsByID[challengeID].push(challengeAttempt);

    let setValue = {
      challengeIDs,
      challengeDataByID,
      challengeAttemptsByID
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

        // let something = JSON.parse(result);
        // data.dispatch(setAttemptsHistory(something));

        resolve(JSON.parse(result));
      })
      .catch( (err) => {
        reject(err);
      });
  });
}
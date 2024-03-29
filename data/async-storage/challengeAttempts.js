import { AsyncStorage } from "react-native";

const prefix = "challengeAttempts:";

// structure:
const storageTemplate = {
  attemptsByChallengeID: {}, // user challenge attempts
};

export async function storeAttemptByChallengeID(uid, attempt, challengeID) {
  let userStorageObject = await getUserStorageObject(uid)
    .catch((err) => {
      throw new Error(err);
    });

  if (userStorageObject.attemptsByChallengeID.hasOwnProperty(challengeID)) {
    userStorageObject.attemptsByChallengeID[challengeID].push(attempt);
  } else {
    userStorageObject.attemptsByChallengeID[challengeID] = [attempt];
  }

  return await saveUserStorageObject(uid, userStorageObject)
    .catch( (err) => {
      throw new Error(err);
    });
}

/**
 * Returns all local user attempts for a given challenge ID
 *
 * @param {Object} obj
 * @param {string} obj.uid
 * @param {string} obj.challengeID
 * @returns {Promise<Array>}
 */
export async function getAttemptsByChallengeID({uid, challengeID}) {
  let userStorageObject = await getUserStorageObject(uid)
    .catch((err) => {
      throw new Error(err);
    });

  if (userStorageObject.attemptsByChallengeID.hasOwnProperty(challengeID)) {
    return userStorageObject.attemptsByChallengeID[challengeID]
  } else {
    return [];
  }
}

export async function getAttemptByChallengeIDAndIndex(uid, challengeID, attemptIndex) {
  const userStorageObject = await getUserStorageObject(uid)
    .catch( (err) => {
      throw new Error(err);
    });

  let attempt;
  if (userStorageObject.attemptsByChallengeID.hasOwnProperty(challengeID)) {
    attempt = userStorageObject.attemptsByChallengeID[challengeID][attemptIndex];
  }

  if (attempt) return attempt;
  else throw new Error("attempt not found!");

}

export async function clearUserAttemptData(uid) {
  return await AsyncStorage
    .removeItem(prefix + uid)
    .then( () => {
      return "success"
    })
    .catch( (err) => {
      throw new Error(err);
    });
}

async function getUserStorageObject(uid) {
  let userStorageObject = await AsyncStorage
    .getItem(prefix + uid)
    .catch((err) => {
      throw new Error(err)
    });

  // create a new user object or parse existing
  if (!userStorageObject) {
    return {...storageTemplate};
  } else {
    return JSON.parse(userStorageObject);
  }
}

async function saveUserStorageObject(uid, userStorageObject) {
  await AsyncStorage
    .setItem(prefix + uid, JSON.stringify(userStorageObject))
    .catch( (err) => {
      throw new Error(err);
    });

  return userStorageObject;
}
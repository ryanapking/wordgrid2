import { AsyncStorage } from 'react-native';

const prefix = "userChallenge:";

// structure:
const userTemplate = {
  challengesByDate: {}, // challenge starting points
  attemptsByDate: {}, // user challenge attempts
};

export async function storeChallengeAttemptByDate(uid, challengeAttempt, date) {
  let userStorageObject = await getUserStorageObject(uid)
    .catch((err) => {
      throw new Error(err);
    });

  if (userStorageObject.attemptsByDate.hasOwnProperty(date)) {
    userStorageObject.attemptsByDate[date].push(challengeAttempt);
  } else {
    userStorageObject.attemptsByDate[date] = [challengeAttempt];
  }

  return await saveUserStorageObject(uid, userStorageObject)
    .catch( (err) => {
      throw new Error(err);
    });
}

export async function storeChallengeByDate(uid, challenge, date) {
  let userStorageObject = await getUserStorageObject(uid)
    .catch((err) => {
      throw new Error(err)
    });

  userStorageObject.challengesByDate[date] = challenge;

  return await saveUserStorageObject(uid, userStorageObject)
    .catch( (err) => {
      throw new Error(err);
    });
}

export async function getChallengeByDate(uid, date) {
  let userStorageObject = await getUserStorageObject(uid)
    .catch( (err) => {
      throw new Error(err);
    });

  if (userStorageObject.challengesByDate.hasOwnProperty(date)) {
    return userStorageObject.challengesByDate[date];
  } else {
    throw new Error("no challenge found for that date");
  }
}

export async function getChallengeAttemptsByDate(uid, date) {
  let userStorageObject = await getUserStorageObject(uid)
    .catch( (err) => {
      throw new Error(err);
    });

  if (userStorageObject.attemptsByDate.hasOwnProperty(date)) {
    return userStorageObject.attemptsByDate[date];
  } else {
    return [];
  }
}

export async function deleteChallengeDataByDate(uid, date) {
  let userStorageObject = await getUserStorageObject(uid)
    .catch( (err) => {
      throw new Error(err);
    });

  delete userStorageObject.challengesByDate[date];
  delete userStorageObject.attemptsByDate[date];

  return await saveUserStorageObject(uid, userStorageObject)
    .catch( (err) => {
      throw new Error(err);
    })
}

export async function clearUserChallengeData(uid) {
  return await AsyncStorage
    .removeItem(prefix + uid)
    .then( () => {
      return "success"
    })
    .catch( (err) => {
      throw new Error(err);
    })
}

async function getUserStorageObject(uid) {
  let userStorageObject = await AsyncStorage
    .getItem(prefix + uid)
    .catch((err) => {
      throw new Error(err)
    });

  // create a new user object or parse existing
  if (!userStorageObject) {
    return {...userTemplate};
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
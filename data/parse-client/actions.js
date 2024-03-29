import Parse from "./client-setup";

/**
 * Accepts or Rejects a game request
 *
 * @param {Object} obj
 * @param {string} obj.gameID
 * @param {boolean} obj.accept
 * @returns {Promise<any>}
 */
export async function respondToRequest({gameID, accept}) {
  return await Parse.Cloud.run("requestResponse", {gameID, accept}, {})
    .catch( (err) => {
      throw new Error(err);
    });
}

/**
 * Forfeits a game.
 *
 * @param {object} obj
 * @param {string} obj.gameID
 * @returns {Promise<any>}
 */
export async function forfeitGame({gameID}) {
  return await Parse.Cloud.run("forfeitGame", {gameID}, {})
    .catch( (err) => {
      throw new Error(err);
    });
}

/**
 * Starts a new game against a random or specified opponent
 *
 * @param {Object} obj
 * @param {string} obj.opponentID
 * @returns {Promise<any>}
 */
export async function startGame({opponentID}) {
  return await Parse.Cloud.run("startGame", {opponentID}, {})
    .catch( (err) => {
      throw new Error(err);
    });
}

/**
 * Saves a move to Parse
 *
 * @param {Object} obj
 * @param {string} obj.gameID
 * @param {string} obj.move
 * @returns {Promise<any>}
 */
export async function saveMove({gameID, move}) {
  return await Parse.Cloud.run("saveMove", {gameID, move}, {})
    .catch( (err) => {
      throw new Error(err);
    });
}

export async function saveChallengeAttempt(challengeAttempt) {
  return await Parse.Cloud.run("saveChallengeAttempt", {challengeAttempt}, {})
    .catch( (err) => {
      throw new Error(err);
    });
}

/**
 * Adds a friend in Parse
 *
 * @param {Object} obj
 * @param {string} obj.friendID
 * @returns {Promise<any>}
 */
export async function addFriend({friendID}) {
  return await Parse.Cloud.run("addFriend", {friendID}, {})
    .catch( (err) => {
      throw new Error(err);
    });
}

/**
 * Removes a friend in Parse
 *
 * @param {Object} obj
 * @param {string} obj.friendID
 * @returns {Promise<any>}
 */
export async function removeFriend({friendID}) {
  return await Parse.Cloud.run("removeFriend", {friendID}, {})
    .catch((err) => {
      throw new Error(err);
    });
}
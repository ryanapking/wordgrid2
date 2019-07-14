import Parse from "./client-setup";

export async function respondToRequest(gameID, accept) {
  let response = await Parse.Cloud.run("requestResponse", {gameID, accept})
    .catch( (err) => {
      throw new Error(err);
    });

  return response;
}

export async function forfeitGame(gameID) {
  let forfeitResponse = await Parse.Cloud.run("forfeitGame", {gameID})
    .catch( (err) => {
      throw new Error(err);
    });

  return forfeitResponse;
}

export async function startGame(opponentID = null) {
  let newGame = await Parse.Cloud.run("startGame", {opponentID})
    .catch( (err) => {
      throw new Error(err);
    });

  return newGame;
}

export async function saveMove(gameID, move) {
  let savedMove = await Parse.Cloud.run("saveMove", {gameID, move})
    .catch( (err) => {
      throw new Error(err);
    });

  return savedMove;
}

export async function saveChallengeAttempt(challengeAttempt) {
  let savedAttempt = await Parse.Cloud.run("saveChallengeAttempt", {challengeAttempt})
    .catch( (err) => {
      throw new Error(err);
    });

  return savedAttempt;
}

export async function addFriend(friendID) {
  let newFriend = await Parse.Cloud.run("addFriend", {friendID})
    .catch( (err) => {
      throw new Error(err);
    });

  console.log('addFriend returned:', newFriend);

  return newFriend;
}
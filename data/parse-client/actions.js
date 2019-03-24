import Parse from "./client-setup";

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
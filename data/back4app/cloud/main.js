const challenges = require('./challenges');
const games = require('./games');

Parse.Cloud.job("createNewChallenge", async function() {
  return await challenges.createChallengesForWeek();
});

Parse.Cloud.define("saveChallengeAttempt", async function(request) {
  return await challenges.saveChallengeAttempt(request);
});

Parse.Cloud.define("saveMove", async function(request) {
  return await games.saveMove(request);
});

Parse.Cloud.define("startGame", async function(request) {
  return await games.startGame(request);
});
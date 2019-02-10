const validations = require('../utilities/functions/checks');

const saveChallengeAttempt = async function(request) {
  if (!request.user) throw new Error('invalid user');

  const { challengeAttempt } = request.params;

  const ChallengesObject = Parse.Object.extend("Challenges");

  let remoteChallengeObject = await new Parse.Query(ChallengesObject)
    .get(challengeAttempt.challengeId, { useMasterKey: true })
    .catch( (err) => {
      throw new Error(err);
    });

  let attemptValid = validations.validateChallengeAttempt(remoteChallengeObject, challengeAttempt);
  if (!attemptValid) throw new Error("attempt not valid!");

  // repack the object provided with the request to prevent any data stuffing
  const movesToSave = challengeAttempt.moves.map( (move) => {
    return {
      w: move.w,
      wv: move.wv,
      wp: move.wp,
      pr: move.pr,
      pv: move.pv,
    };
  });

  const ChallengeAttemptObject = Parse.Object.extend("ChallengeAttempt");
  const savedAttempt = await new ChallengeAttemptObject()
    .set("user", request.user)
    .set("challenge", remoteChallengeObject)
    .set("score", challengeAttempt.score)
    .set("moves", movesToSave)
    .setACL(new Parse.ACL({
      '*': {},
      [request.user.id]: { "read": true }
    }))
    .save(null, { useMasterKey: true })
    .catch( (err) => {
      throw new Error(err);
    });

  return savedAttempt;
};

module.exports = saveChallengeAttempt;
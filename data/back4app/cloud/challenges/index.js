let moment = require("moment");

const generators = require("../utilities/functions/generators");

const createNewChallenge = async function() {
  const challenge = generators.generateChallenge();
  let now = moment();

  const ChallengesObject = Parse.Object.extend("Challenges");
  let challengeObject = await new ChallengesObject()
    .set("startDate", now.toDate())
    .set("endDate", now.add(1, "day").toDate())
    .set("startingBoard", challenge.startingBoard)
    .set("startingPieces", challenge.startingPieces)
    .set("pieceBank", challenge.pieceBank)
    .save(null, { useMasterKey: true})
    .catch( (err) => {
      throw new Error(err);
    });

  return challengeObject;
};

module.exports = {
  createNewChallenge
};
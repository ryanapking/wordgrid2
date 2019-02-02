let moment = require("moment");

const generators = require("../utilities/functions/generators");

const createChallengesForWeek = async function() {
  let today = moment();

  let challengesCreated = [];

  // create today's challenge
  challengesCreated.push(await createChallengeByDate(today));

  // create challenges for the next six days
  for (let i = 0; i < 6; i++) {
    challengesCreated.push(await createChallengeByDate(today.add(1, "day")));
  }

  return challengesCreated;

};

const createChallengeByDate = async function(date) {
  let existingChallenge = await getChallengeByDate(date.toDate());
  if (existingChallenge) {
    return {
      msg: "challenge already exists",
      challenge: existingChallenge,
    };
  }

  const challenge = generators.generateChallenge();

  const ChallengesObject = Parse.Object.extend("Challenges");
  let challengeObject = await new ChallengesObject()
    .set("startDate", date.startOf('day').toDate())
    .set("endDate", date.endOf('day').toDate())
    .set("startingBoard", challenge.startingBoard)
    .set("startingPieces", challenge.startingPieces)
    .set("pieceBank", challenge.pieceBank)
    .save(null, { useMasterKey: true})
    .catch( (err) => {
      throw new Error(err);
    });

  return challengeObject;
};

const getChallengeByDate = async function(date) {
  const ChallengesObject = Parse.Object.extend("Challenges");

  let foundChallenge = await new Parse.Query(ChallengesObject)
    .lessThanOrEqualTo("startDate", date)
    .greaterThanOrEqualTo("endDate", date)
    .limit(1)
    .find({ useMasterKey: true });

  if (foundChallenge.length > 0) {
    return foundChallenge[0];
  } else {
    return null;
  }
};

module.exports = {
  createChallengesForWeek,
};
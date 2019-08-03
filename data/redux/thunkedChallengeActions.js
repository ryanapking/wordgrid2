import { challengeStateToAttempt } from "../utilities/functions/dataConversions";
import { saveChallengeAttempt } from "../parse-client/actions";
import { storeAttemptByChallengeID } from "../async-storage/challengeAttempts";
import { getCurrentChallenge } from "../parse-client/getters";
import { setErrorMessage } from "./messages";
import { setLocalChallengeData } from "./challengeData";

export function saveAttempt(userID) {
  return (dispatch, getState) => {
    const {challengeData} = getState();
    const {challenge} = challengeData;
    const challengeAttempt = challengeStateToAttempt(challenge);
    saveChallengeAttempt(challengeAttempt)
      .then(() => {
        console.log('challenge saved remotely');
      })
      .catch((err) => {
        console.log('error saving attempt remotely', err);
      });
    storeAttemptByChallengeID(userID, challengeAttempt, challenge.id)
      .then(() => {
        console.log('challenge stored successfully');
      })
      .catch((err) => {
        console.log('error storing attempt to local async storage:', err);
      });
  };
}

export function startChallenge() {
  return (dispatch) => {
    getCurrentChallenge()
      .then((currentChallenge) => {
        dispatch(setLocalChallengeData(currentChallenge));
      })
      .catch((err) => {
        dispatch(setErrorMessage('unable to find current challenge'));
      });
  };
}
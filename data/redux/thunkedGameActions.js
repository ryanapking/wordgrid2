// centralized point for complex action creators that use thunk to make remote calls and/or string together other action creators

import { saveMove as parseSaveMove } from "../parse-client/actions";
import { localToRemote } from "../utilities/functions/dataConversions";
import { validateMove } from "../utilities/functions/checks";
import { setErrorMessage } from "./messages";

export function saveMove(gameID, uid) {
  return (dispatch, getState) => {
    const game = getState().gameData.byID[gameID];
    const move = localToRemote(game, uid);

    // nothing currently happens with the validation
    // mainly here to trigger the function for now
    const moveValid = validateMove(uid, game.sourceData, move);
    console.log('move valid?', moveValid);

    parseSaveMove({gameID, move})
      .catch((err) => {
        dispatch(setErrorMessage(err))
      });
  }
}
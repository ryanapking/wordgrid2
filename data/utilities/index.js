// logic has been moved into the back4app directory to prevent the need for duplicated code
// exported here for convenience

export { generateBoard, generatePiece, generateLocalPiece, generateGame, getRandomLetter } from '../b4a-cloud-functions/cloud/utilities/functions/generators';
export { remoteToLocal, localToRemote, wordPathArrayToString, boardStringToArray, pieceStringToArray, wordPathStringToArray, challengeRemoteToLocal, challengeMoveToHistory } from '../b4a-cloud-functions/cloud/utilities/functions/dataConversions';
export { calculateWordValue, calculateHighestWordValue, calculateLongestWordLength, calculateMoveRating } from '../b4a-cloud-functions/cloud/utilities/functions/calculations';
export { checkPieceFit, scoreTabulator, getWinner } from '../b4a-cloud-functions/cloud/utilities/functions/checks';
export { getScoreBoard, getAnimationData, getWordPath } from '../b4a-cloud-functions/cloud/utilities/functions/getters';
export { letterValues } from '../b4a-cloud-functions/cloud/utilities/config';
// logic has been moved into the back4app directory to prevent the need for duplicated code
// exported here for convenience

export { generateBoard, generatePiece, generateLocalPiece, generateGame, getRandomLetter } from '../back4app/cloud/utilities/functions/generators';
export { remoteToLocal, localToRemote, wordPathArrayToString, boardStringToArray, pieceStringToArray, wordPathStringToArray, challengeRemoteToLocal, challengeMoveToHistory } from '../back4app/cloud/utilities/functions/dataConversions';
export { calculateWordValue, calculateHighestWordValue, calculateLongestWordLength, calculateMoveRating } from '../back4app/cloud/utilities/functions/calculations';
export { checkPieceFit, scoreTabulator, getWinner, validateMove } from '../back4app/cloud/utilities/functions/checks';
export { getScoreBoard, getAnimationData, getWordPath } from '../back4app/cloud/utilities/functions/getters';
export { letterValues } from '../back4app/cloud/utilities/config';
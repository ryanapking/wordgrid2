// logic has been moved into the back4app directory to prevent the need for duplicated code
// exported here for convenience

export { generateBoard, generatePiece, generateLocalPiece, generateGame, getRandomLetter } from '../back4app/cloud/utilities/functions/generators';
export { remoteToStartingGameState, remoteToLocal, localToRemote, wordPathArrayToString, boardStringToArray, arrayToString, pieceStringToArray, wordPathStringToArray, challengeRemoteToLocal, challengeMoveToHistory, moveRemoteToLocal, nextPieceStringToLocalPiece, nextPieceStringToRemotePiece } from '../back4app/cloud/utilities/functions/dataConversions';
export { calculateWordValue, calculateHighestWordValue, calculateLongestWordLength, calculateMoveRating } from '../back4app/cloud/utilities/functions/calculations';
export { checkPieceFit, getWinner, validateMove } from '../back4app/cloud/utilities/functions/checks';
export { getAnimationData, getWordPath } from '../back4app/cloud/utilities/functions/getters';
export { applyMove } from '../back4app/cloud/utilities/functions/applyMoves';
export { letterValues } from '../back4app/cloud/utilities/config';
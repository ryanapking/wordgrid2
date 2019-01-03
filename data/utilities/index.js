export { generateBoard, generatePiece, generateLocalPiece, generateGame, getRandomLetter } from './functions/generators';
export { remoteToLocal, localToRemote, wordPathArrayToString, boardStringToArray, pieceStringToArray, wordPathStringToArray, challengeRemoteToLocal, challengeMoveToHistory } from './functions/dataConversions';
export { calculateWordValue, calculateHighestWordValue, calculateLongestWordLength, calculateMoveRating } from './functions/calculations';
export { checkPieceFit, scoreTabulator, getWinner } from './functions/checks';
export { getScoreBoard, getAnimationData, getWordPath } from './functions/getters';
export { letterValues } from './config';
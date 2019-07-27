const config = require('./config');
const applyMoves = require('./functions/applyMoves');
const calculations = require('./functions/calculations');
const checks = require('./functions/checks');
const dataConversions = require('./functions/dataConversions');
const generators = require('./functions/generators');
const getters = require('./functions/getters');

module.exports = {
  settings: config.settings,
  letterRanges: config.letterRanges,
  letterValues: config.letterValues,

  applyMove: applyMoves.applyMove,
  challengePlayWord: applyMoves.challengePlayWord,
  challengePlacePiece: applyMoves.challengePlacePiece,
  getBoardMinusPiece: applyMoves.getBoardMinusPiece,
  getBoardPlusPiece: applyMoves.getBoardPlusPiece,
  getBoardMinusWordPath: applyMoves.getBoardMinusWordPath,
  filterConsumedPieces: applyMoves.filterConsumedPieces,
  getCurrentPiecesFromIndexes: applyMoves.getCurrentPiecesFromIndexes,

  calculateWordValue: calculations.calculateWordValue,
  calculatePiecePlacementValue: calculations.calculatePiecePlacementValue,
  calculateLongestWordLength: calculations.calculateLongestWordLength,
  calculateHighestWordValue: calculations.calculateHighestWordValue,
  calculateMoveRating: calculations.calculateMoveRating,
  numWithSuffix: calculations.numWithSuffix,

  validateChallengeAttempt: checks.validateChallengeAttempt,
  checkPieceFit: checks.checkPieceFit,
  gameOverCheck: checks.gameOverCheck,
  getWinner: checks.getWinner,
  validateMove: checks.validateMove,
  validatePlacement: checks.validatePlacement,

  remoteToStartingGameState: dataConversions.remoteToStartingGameState,
  remoteToLocal: dataConversions.remoteToLocal,
  challengeRemoteToPlayableObject: dataConversions.challengeRemoteToPlayableObject,
  challengeStateToMove: dataConversions.challengeStateToMove,
  challengeStateToAttempt: dataConversions.challengeStateToAttempt,
  challengeAttemptToReviewObject: dataConversions.challengeAttemptToReviewObject,
  localToRemote: dataConversions.localToRemote,
  pieceStringToArray: dataConversions.pieceStringToArray,
  boardStringToArray: dataConversions.boardStringToArray,
  arrayToString: dataConversions.arrayToString,
  calculateScore: dataConversions.calculateScore,
  wordPathArrayToString: dataConversions.wordPathArrayToString,
  wordPathStringToArray: dataConversions.wordPathStringToArray,
  placementRefStringToArray: dataConversions.placementRefStringToArray,
  nextPieceStringToLocalPiece: dataConversions.nextPieceStringToLocalPiece,
  nextPieceStringToRemotePiece: dataConversions.nextPieceStringToRemotePiece,
  moveRemoteToLocal: dataConversions.moveRemoteToLocal,

  generateGame: generators.generateGame,
  generateChallenge: generators.generateChallenge,
  generateBoard: generators.generateBoard,
  generatePiece: generators.generatePiece,
  generateLocalPiece: generators.generateLocalPiece,
  getRandomLetter: generators.getRandomLetter,
  setCharAt: generators.setCharAt,

  getAnimationData: getters.getAnimationData,
  getWordPath: getters.getWordPath,
};
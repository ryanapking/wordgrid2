const settings = {
  boardWidth: 10,
  boardHeight: 10,

  startingLetterDensity: .7,

  naturalTurns: 5,

  playerPieceSize: 4, // maybe this should be a range,
  maxPieceWidth: 4,
  maxPieceHeight: 4,
};

export default settings;

export const letterValues = {
  "a": 1,
  "b": 3,
  "c": 3,
  "d": 2,
  "e": 1,
  "f": 4,
  "g": 2,
  "h": 4,
  "i": 1,
  "j": 8,
  "k": 5,
  "l": 1,
  "m": 3,
  "n": 1,
  "o": 1,
  "p": 3,
  "q": 10,
  "r": 1,
  "s": 1,
  "t": 1,
  "u": 1,
  "v": 4,
  "w": 4,
  "x": 8,
  "y": 4,
  "z": 10,
};

const letterWeights = {
  "a": 812,
  "b": 149,
  "c": 271,
  "d": 432,
  "e": 1202,
  "f": 230,
  "g": 203,
  "h": 592,
  "i": 731,
  "j": 10,
  "k": 69,
  "l": 398,
  "m": 261,
  "n": 695,
  "o": 768,
  "p": 182,
  "q": 11,
  "r": 602,
  "s": 628,
  "t": 910,
  "u": 288,
  "v": 111,
  "w": 209,
  "x": 17,
  "y": 211,
  "z": 7,
};

const letters = Object.keys( letterWeights );
const letterRangesStructure = {
  low: 0,
  high: 0,
  ranges: [],
};

export const letterRanges = letters.reduce( (result, letter) => {
  const newHigh = result.high + letterWeights[letter];
  const letterRange = { letter: letter, low: result.high, stop: newHigh };
  return {
    low: result.low,
    high: newHigh,
    ranges: [...result.ranges, letterRange]
  };
}, letterRangesStructure);
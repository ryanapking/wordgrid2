const config = require('../config');

function calculateWordValue(word) {
  return word.split("").reduce( (total, letter) => {
    return total + config.letterValues[letter.toLowerCase()];
  }, 0);
}

function calculatePiecePlacementValue(pieceArray) {
  let placementValue = 0;
  pieceArray.forEach((row) => {
    row.forEach((letter) => {
      if (letter) {
        placementValue++; // each letter on tile placed worth one point
      }
    });
  });
  return placementValue;
}

function calculateMoveRating(word, longestWord, mostValuableWord) {
  // return a value from 0 to 10 which will be displayed in half stars
  if (word.length < 4) return 0;
  const wordValue = calculateWordValue(word);
  if (word.length >= longestWord || wordValue >= mostValuableWord) {
    return 10;
  } else {
    const valueScore = (wordValue / mostValuableWord) * 5;
    const lengthScore = (word.length / longestWord) * 5;

    const rating = Math.floor(valueScore + lengthScore);

    // console.log('rating', rating);

    return rating;
  }
}

function numWithSuffix(num) {
  const parsedNum = parseInt(num);
  let ones = parsedNum % 10;
  let tens = parsedNum % 100;
  if (ones === 1 && tens !== 11) {
    return num + "st";
  }
  if (ones === 2 && tens !== 12) {
    return num + "nd";
  }
  if (ones === 3 && tens !== 13) {
    return num + "rd";
  }
  return num + "th";
}

module.exports = {
  calculateWordValue,
  calculatePiecePlacementValue,
  calculateMoveRating,
  numWithSuffix,
};
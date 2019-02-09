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

function calculateLongestWordLength(words) {
  const longestWords = words.reduce( (currentLongestWords, word) => {
    if (word.length > currentLongestWords.length) {
      return {words: [word], length: word.length};
    } else if (word.length === currentLongestWords.length) {
      return {...currentLongestWords, words: [...currentLongestWords.words, word]};
    } else {
      return currentLongestWords;
    }
  }, {words: [], length: 0});

  // console.log('longest words:', longestWords.words);
  // console.log(longestWords.length + " letters");

  return longestWords;
}

function calculateHighestWordValue(words) {
  const mostValuableWords = words.reduce( (currentMostValuableWord, word) => {
    const wordValue = calculateWordValue(word);
    if (wordValue > currentMostValuableWord.value) {
      return {words: [word], value: wordValue};
    } else if (wordValue === currentMostValuableWord.value) {
      return {...currentMostValuableWord, words: [...currentMostValuableWord.words, word]};
    } else {
      return currentMostValuableWord;
    }
  }, {words: [], value: 0});

  // console.log('most valuable words:', mostValuableWords.words);
  // console.log(mostValuableWords.value + " points");

  return mostValuableWords;
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

module.exports = {
  calculateWordValue,
  calculatePiecePlacementValue,
  calculateLongestWordLength,
  calculateHighestWordValue,
  calculateMoveRating,
};
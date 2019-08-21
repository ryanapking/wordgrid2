import english from '../english';
import { boardStringToArray } from '../utilities/functions/dataConversions';
import { isSquareInArray } from "../utilities/functions/checks";
import { letterValues } from '../utilities/config';

export const solveBoard = (boardString) => {
  let foundWords = [];

  const boardArray = boardStringToArray(boardString);
  const bounds = {
    lastRow: boardArray.length - 1,
    lastColumn: boardArray[0].length - 1,
  };

  const getStartingPrefix = (rowIndex, columnIndex) => {
    const letter = boardArray[rowIndex][columnIndex];
    const square = {
      rowIndex,
      columnIndex,
      letter,
    };
    return {
      string: letter,
      value: letterValues[letter],
      path: [square],
    };
  };

  // search each board space and add any found words to the array
  for (let rowIndex = 0; rowIndex <= bounds.lastRow; rowIndex++) {
    for (let columnIndex = 0; columnIndex <= bounds.lastColumn; columnIndex++) {
      const startingPrefix = getStartingPrefix(rowIndex, columnIndex);
      const spaceWords = spaceScanner(boardArray, bounds, startingPrefix);
      foundWords = foundWords.concat(spaceWords);
    }
  }

  // compile the found words into some useful information
  const highestValue = foundWords.reduce((highestValue, currentWord) => {
    if (currentWord.value > highestValue) return currentWord.value;
    else return highestValue;
  }, 0);

  const mostValuableWords = foundWords.filter((word) => {
    return word.value >= highestValue;
  });

  const longestLength = foundWords.reduce((longestLength, currentWord) => {
    if (currentWord.path.length > longestLength) return currentWord.path.length;
    else return longestLength;
  }, 0);

  const longestWords = foundWords.filter((word) => {
    return word.path.length >= longestLength;
  });

  // sort found words by value and alphabetically
  foundWords
    .sort((word1, word2) => {
      return word1.string.localeCompare(word2.string);
    })
    .sort( (word1, word2) => {
      return word2.value - word1.value;
    });

  return {
    wordCount: foundWords.length,
    allWords: foundWords,
    longestLength,
    longestWords,
    highestValue,
    mostValuableWords,
  };
};

const spaceScanner = (boardArray, bounds, startingPrefix = {}) => {

  // get the previous added square for our starting point
  const { rowIndex, columnIndex, letter } = startingPrefix.path[startingPrefix.path.length - 1];

  let foundWords = [];

  // lots of squares are empty, get out of here
  if (!letter) return foundWords;

  // map all possible adjacent squares
  const adjacentSquares = [
    {rowIndex: rowIndex, columnIndex: columnIndex - 1},
    {rowIndex: rowIndex - 1, columnIndex: columnIndex - 1},
    {rowIndex: rowIndex - 1, columnIndex: columnIndex},
    {rowIndex: rowIndex - 1, columnIndex: columnIndex + 1},
    {rowIndex: rowIndex, columnIndex: columnIndex + 1},
    {rowIndex: rowIndex + 1, columnIndex: columnIndex + 1},
    {rowIndex: rowIndex + 1, columnIndex: columnIndex},
    {rowIndex: rowIndex + 1, columnIndex: columnIndex - 1},
  ];

  // recursively call for each adjacent square after checking validity
  for (let i = 0; i < adjacentSquares.length; i++) {
    const nextSquare = adjacentSquares[i];
    const { rowIndex, columnIndex } = nextSquare;

    // stop if we are out of bounds
    if (rowIndex < 0 || rowIndex > bounds.lastRow || columnIndex < 0 || columnIndex > bounds.lastColumn) continue;

    // stop if the square is already used
    if (isSquareInArray(nextSquare, startingPrefix.path)) continue;

    const nextLetter = boardArray[rowIndex][columnIndex];

    // stop if the next square is empty
    if (!nextLetter) continue;

    const nextString = startingPrefix.string + nextLetter;
    const nextStartingPrefix = {
      string: nextString,
      value: startingPrefix.value + letterValues[nextLetter],
      path: startingPrefix.path.concat([{
        rowIndex,
        columnIndex,
        letter: nextLetter,
      }]),
    };

    // if we have a valid prefix, keep scanning
    if (english.isPrefix(nextString)) {
      foundWords = foundWords.concat(spaceScanner(boardArray, bounds, nextStartingPrefix));
    }

    // if we have a valid word, push it to our array to be returned
    if (english.contains(nextString)) {
      foundWords.push(nextStartingPrefix);
    }
  }

  return foundWords;
};
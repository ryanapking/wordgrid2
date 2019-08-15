import React from 'react';
import { render } from 'react-native-testing-library';

import BoardDrawLetterGrid from "../BoardDrawLetterGrid";

// mock DrawLetter to reduce snapshot size
jest.mock('../DrawLetter', () => 'DrawLetter');

// prop values for render tests
const testBoardSize = 150;
const testBoardState = [
  ["","","m","b","h","o","o","i","h","r"],
  ["e","","p","d","","","","h","","c"],
  ["","e","s","a","h","a","g","","h",""],
  ["","r","","i","h","","i","","",""],
  ["","","r","","d","a","","t","s","u"],
  ["o","","","","","u","u","a","v","r"],
  ["e","","i","h","s","l","s","","","o"],
  ["u","e","m","n","r","s","e","t","h","i"],
  ["","","","b","","h","m","s","t","r"],
  ["r","","u","u","i","","r","l","",""]
];
const testConsumedSquares = [
  {rowIndex: 4, columnIndex: 3, letter: "s"},
  {rowIndex: 3, columnIndex: 2, letter: "p"},
  {rowIndex: 4, columnIndex: 1, letter: "a"},
  {rowIndex: 5, columnIndex: 2, letter: "w"},
  {rowIndex: 5, columnIndex: 3, letter: "n"},
  {rowIndex: 6, columnIndex: 4, letter: "s"},
];
const testHoveredSquares = [
  {"rowIndex":8,"columnIndex":4},
  {"rowIndex":8,"columnIndex":5},
  {"rowIndex":8,"columnIndex":6},
  {"rowIndex":9,"columnIndex":5},
];

describe('BoardDrawLetterGrid', () => {
  it('renders correctly with consumed squares', () => {
    const { unmount, toJSON } = render(<BoardDrawLetterGrid boardState={testBoardState} consumedSquares={testConsumedSquares} boardSize={testBoardSize} />);
    expect(toJSON()).toMatchSnapshot();
    unmount();
  });

  it('renders correctly with hovered spaces', () => {
    const { unmount, toJSON } = render(<BoardDrawLetterGrid boardState={testBoardState} hoveredSquares={testHoveredSquares} />);
    expect(toJSON()).toMatchSnapshot();
    unmount();
  });
});
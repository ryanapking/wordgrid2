import React from 'react';
import { render } from 'react-native-testing-library';

import ChallengePieceSetDisplay from "..";

// mock child components
jest.mock('../../DrawPieceSection', () => 'DrawPieceSection');

// mock View component with measure
jest.mock('react-native/Libraries/Components/View/View', () => {
  const mockComponent = require('react-native/jest/mockComponent');
  const measure = (measureCallback) => {
    measureCallback(1, 1, 10, 10, 6, 6);
  };
  return mockComponent('react-native/Libraries/Components/View/View', { measure });
});

describe('ChallengePieceSetDisplay', () => {
  it('renders correctly', () => {
    const { toJSON, unmount } = render(
      <ChallengePieceSetDisplay consumedSquares={[]} pieceSet={testPieceSet} word={''} />
    );
    expect(toJSON()).toMatchSnapshot();
    unmount();
  });

  it('renders null if word is passed to props', () => {
    const { toJSON, unmount } = render(
      <ChallengePieceSetDisplay consumedSquares={testConsumedSquares} pieceSet={testPieceSet} word={'hello'} />
    );
    expect(toJSON()).toBeNull();
    unmount();
  });

  it('repositions the view when a new square is consumed', () => {
    // TODO: Test is causing issues. Need to figure out how to mock findNodeHandle, or how to mock our child components
    const { toJSON, unmount } = render(
      <ChallengePieceSetDisplay consumedSquares={testConsumedSquares} pieceSet={testPieceSet} word={''} />
    );
    expect(toJSON()).not.toBeNull();
    unmount();
  });
});

const testConsumedSquares = [
  {rowIndex: 7,columnIndex: 6, letter: "s"},
  {rowIndex: 8,columnIndex: 7, letter: "h"},
  {rowIndex: 8,columnIndex: 6, letter: "e"},
  {rowIndex: 9,columnIndex: 7, letter: "e"},
  {rowIndex: 9,columnIndex: 6, letter: "n"},
];

const testPieceSet = {
  4: [
    ["","","",""],
    ["","","",""],
    ["t","n","c",""],
    ["l","","",""]
  ],
  5: [
    ["","","","d"],
    ["","","s","w"],
    ["","","s","o"],
    ["","","",""]
  ],
  6: [
    ["","","",""],
    ["","","",""],
    ["t","a","g","i"],
    ["","","h","l"]
  ],
  7: [
    ["","","",""],
    ["o","e","n",""],
    ["l","m","y",""],
    ["","","n",""]
  ],
  8: [
    ["e","i","","o"],
    ["","u","s","i"],
    ["","u","","o"],
    ["","","",""]
  ],
  9: [
    ["","","",""],
    ["","","h","h"],
    ["n","","f","u"],
    ["e","f","i","e"]
  ],
  10: [
    ["","i","i",""],
    ["u","m","",""],
    ["","u","t","h"],
    ["","e","p","t"]
  ],
  11: [
    ["","m","i","a"],
    ["","f","f","c"],
    ["","i","","n"],
    ["t","i","r",""]
  ],
  12: [
    ["","g","d",""],
    ["n","h","",""],
    ["h","m","d","u"],
    ["d","e","d","i"]
  ],
  13: [
    ["","e","n","s"],
    ["","e","i","d"],
    ["","w","i","r"],
    ["n","b","d","e"]
  ],
  14: [
    ["h","","","s"],
    ["c","t","e","l"],
    ["l","f","f","p"],
    ["v","t","t","s"]
  ],
  15: [
    ["e","e","t","y"],
    ["","h","h","h"],
    ["t","d","r","m"],
    ["h","e","l","t"]
  ],
  16: [
    ["a","r","t","v"],
    ["i","h","u","t"],
    ["u","n","r","u"],
    ["d","r","e","d"]
  ]
};
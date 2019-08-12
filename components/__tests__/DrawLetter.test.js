import React from 'react';
import DrawLetter from "../DrawLetter";

import renderer from 'react-test-renderer';

test('DrawLetter renders correctly', () => {
  const drawLetterWithSize = renderer.create(<DrawLetter letter="a" letterSize={25} />).toJSON();
  expect(drawLetterWithSize).toMatchSnapshot();

  const drawLetterWithoutSize = renderer.create(<DrawLetter letter="q" />).toJSON();
  expect (drawLetterWithoutSize).toMatchSnapshot();

  const drawLetterWithoutLetter = renderer.create(<DrawLetter />).toJSON();
  expect (drawLetterWithoutLetter).toMatchSnapshot();
});
import React from 'react';
import DrawPieceSection from "../DrawPieceSection";
import { Provider } from "react-redux";

import configureStore from '../../data/redux/configureStore';
import renderer from 'react-test-renderer';

const store = configureStore();

const testPieces = [
  [
    ["","","",""],
    ["","","",""],
    ["","","d","s"],
    ["","","e","i"]
  ],
  [
    ["","","h",""],
    ["","","e",""],
    ["","","w","l"],
    ["","","",""]
  ],
  [
    ["","","",""],
    ["","","",""],
    ["l","c","r",""],
    ["","o","",""]
  ],
];

// Mock the nested components to avoid snapshotting components that are tested separately
jest.mock('../PieceDraggableView', () => 'PieceDraggableView');
jest.mock('../PieceDrawLetterGrid', () => 'PieceDrawLetterGrid');
jest.mock('../MeasureView', () => 'MeasureView');

test ('DrawPieceSection renders correctly', () => {
  const drawPieceAllowDrag = renderer.create(
    <Provider store={store}>
      <DrawPieceSection pieces={testPieces} allowDrag={true} />);
    </Provider>
  );
  expect(drawPieceAllowDrag).toMatchSnapshot();

  const drawPieceNoDrag = renderer.create(
    <Provider store={store}>
      <DrawPieceSection pieces={testPieces} allowDrag={false} />);
    </Provider>
  );
  expect(drawPieceNoDrag).toMatchSnapshot();
});
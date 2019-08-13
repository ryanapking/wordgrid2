import React from 'react';
import { Provider } from "react-redux";
import { render, fireEvent } from "react-native-testing-library";

import MeasureView from "../MeasureView";
import DrawPieceSection from "../DrawPieceSection";

import configureStore from '../../data/redux/configureStore';
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
  const drawPieceAllowDrag = render(
    <Provider store={store}>
      <DrawPieceSection pieces={testPieces} allowDrag={true} />);
    </Provider>
  );

  drawPieceAllowDrag.getAllByType(MeasureView).forEach((measureView) => {
    fireEvent(measureView, "onMeasure", 5, 5, 100, 100, 105, 105);
  });

  const reduxPieceLocations = store.getState().gameDisplay.pieceLocations;

  const expectedLocation = {
    x:5,
    y:5,
    width:100,
    height:100,
    pageX:105,
    pageY:105,
    piece: testPieces[1],
  };

  expect(reduxPieceLocations[1]).toMatchObject(expectedLocation);
  expect(drawPieceAllowDrag.toJSON()).toMatchSnapshot();

  drawPieceAllowDrag.unmount();

  const drawPieceNoDrag = render(
    <Provider store={store}>
      <DrawPieceSection pieces={testPieces} allowDrag={false} />);
    </Provider>
  );

  drawPieceNoDrag.getAllByType(MeasureView).forEach((measureView) => {
    fireEvent(measureView, "onMeasure", 5, 5, 100, 100, 105, 105);
  });

  expect(drawPieceNoDrag).toMatchSnapshot();
  drawPieceAllowDrag.unmount();
});
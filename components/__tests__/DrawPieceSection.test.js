import React from 'react';
import { Provider } from "react-redux";
import { render, fireEvent } from "react-native-testing-library";

import * as gameDisplay from "../../data/redux/gameDisplay";

import MeasureView from "../MeasureView";
import DrawPieceSection from "../DrawPieceSection";
import PieceDrawLetterGrid from "../PieceDrawLetterGrid";

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

const setPieceLocationMock = jest.spyOn(gameDisplay, "setPieceLocation");
const clearPieceLocationsMock = jest.spyOn(gameDisplay, "clearPieceLocations");

afterEach( () => {
  jest.clearAllMocks();
});

describe('DrawPieceSection', () => {
  it('renders with allowDrag', () => {
    const renderedComponent = render(
      <Provider store={store}>
        <DrawPieceSection pieces={testPieces} allowDrag={true} />
      </Provider>
    );

    expect(renderedComponent.toJSON()).toMatchSnapshot();
  });

  it('renders without allowDrag', () => {
    const renderedComponent = render(
      <Provider store={store}>
        <DrawPieceSection pieces={testPieces} allowDrag={false} />
      </Provider>
    );

    expect(renderedComponent.toJSON()).toMatchSnapshot();
  });

  it('calls redux setPieceLocations()', () => {
    const renderedComponent = render(
      <Provider store={store}>
        <DrawPieceSection pieces={testPieces} allowDrag={true} />
      </Provider>
    );

    // fire onMeasure event for all MeasureView components
    renderedComponent.getAllByType(MeasureView).forEach((measureView) => {
      fireEvent(measureView, "onMeasure", 5, 5, 100, 100, 105, 105);
    });

    // spot check the setPieceLocation calls
    expect(setPieceLocationMock).toBeCalledTimes(3);
    expect(setPieceLocationMock).toBeCalledWith(2, expect.objectContaining({x: 5}));
  });

  it('calls redux clearPieceLocations on unmount', () => {
    const renderedComponent = render(
      <Provider store={store}>
        <DrawPieceSection pieces={testPieces} allowDrag={true} />
      </Provider>
    );

    renderedComponent.unmount();

    expect(clearPieceLocationsMock).toBeCalledTimes(1);
  });

  it('sets children baseSize correctly', () => {
    const renderedComponent = render(
      <Provider store={store}>
        <DrawPieceSection testID="allowDrag" pieces={testPieces} allowDrag={false} />
      </Provider>
    );

    // fire onMeasure event for all MeasureView components
    renderedComponent.getAllByType(MeasureView).forEach((measureView) => {
      fireEvent(measureView, "onMeasure", 5, 5, 100, 100, 105, 105);
    });

    // check that each piece is set to the appropriate width
    renderedComponent.getAllByType(PieceDrawLetterGrid).forEach((letterGrid) => {
      expect(letterGrid.props.pieceSize).toEqual(100);
    });
  });
});

import React from 'react';
import { render, fireEvent } from "react-native-testing-library";
import * as redux from 'react-redux';

import * as gameDisplay from "../../../data/redux/gameDisplay";

import DrawPieceSection from "..";
import MeasureView from "../../MeasureView";
import PieceDrawLetterGrid from "../../PieceDrawLetterGrid";

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
jest.mock('../../PieceDraggableView', () => 'PieceDraggableView');
jest.mock('../../PieceDrawLetterGrid', () => 'PieceDrawLetterGrid');
jest.mock('../../MeasureView', () => 'MeasureView');

// mock redux dispatch and useDispatch
const dispatchMock = jest.fn((object) => {});
const useDispatchSpy = jest.spyOn(redux, "useDispatch").mockImplementation( () => dispatchMock );

// set spy on action creators
const setPieceLocationSpy = jest.spyOn(gameDisplay, "setPieceLocation");
const clearPieceLocationsSpy = jest.spyOn(gameDisplay, "clearPieceLocations");

afterEach( () => {
  jest.clearAllMocks();
});

describe('DrawPieceSection', () => {
  it('renders with allowDrag', () => {
    const renderedComponent = render(
      <DrawPieceSection pieces={testPieces} allowDrag={true} />
    );

    expect(renderedComponent.toJSON()).toMatchSnapshot();
  });

  it('renders without allowDrag', () => {
    const renderedComponent = render(
      <DrawPieceSection pieces={testPieces} allowDrag={false} />
    );

    expect(renderedComponent.toJSON()).toMatchSnapshot();
  });

  it('calls redux setPieceLocations()', () => {
    const renderedComponent = render(
      <DrawPieceSection pieces={testPieces} allowDrag={true} />
    );

    // fire onMeasure event for all MeasureView components
    renderedComponent.getAllByType(MeasureView).forEach((measureView) => {
      fireEvent(measureView, "onMeasure", 5, 5, 100, 100, 105, 105);
    });

    // spot check the setPieceLocation calls
    expect(setPieceLocationSpy).toBeCalledTimes(3);
    expect(setPieceLocationSpy).toBeCalledWith(2, expect.objectContaining({x: 5}));
  });

  it('calls redux clearPieceLocations on unmount', () => {
    const renderedComponent = render(
      <DrawPieceSection pieces={testPieces} allowDrag={true} />
    );

    renderedComponent.unmount();

    expect(clearPieceLocationsSpy).toBeCalledTimes(1);
  });

  it('sets children baseSize correctly', () => {
    const renderedComponent = render(
      <DrawPieceSection testID="allowDrag" pieces={testPieces} allowDrag={false} />
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

import React from 'react';
import { render } from 'react-native-testing-library';

import BoardPathCreator from "..";
import BoardDrawPath from "../../BoardDrawPath";

// mock BoardDrawPath to reduce snapshot size
jest.mock('../../BoardDrawPath', () => 'BoardDrawPath');

const testProps = {
  squares: [
    {rowIndex: 6, columnIndex: 4},
    {rowIndex: 6, columnIndex: 3},
    {rowIndex: 5, columnIndex: 3},
    {rowIndex: 5, columnIndex: 2},
    {rowIndex: 4, columnIndex: 2},
    {rowIndex: 3, columnIndex: 3},
  ],
  boardLocation: {rowHeight: 38.6, columnWidth: 37.5},
};

describe('BoardPathCreator', () => {
  it('creates the correct number of paths for the given squares', () => {
    const { unmount, queryAllByType } = render(
      <BoardPathCreator boardLocation={testProps.boardLocation} squares={testProps.squares} />
    );
    expect(queryAllByType(BoardDrawPath)).toHaveLength(testProps.squares.length - 1);
    unmount();
  });

  it('renders as expected', () => {
    const { unmount, toJSON } = render(
      <BoardPathCreator boardLocation={testProps.boardLocation} squares={testProps.squares} />
    );
    expect(toJSON()).toMatchSnapshot();
    unmount();
  });

  it('renders null without boardLocation', () => {
    const { unmount, toJSON } = render(
      <BoardPathCreator squares={testProps.squares} />
    );
    expect(toJSON()).toBeNull();
    unmount();
  });
});
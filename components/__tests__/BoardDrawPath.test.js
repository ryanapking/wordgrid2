import React from 'react';
import { render } from 'react-native-testing-library';

import BoardDrawPath from "../BoardDrawPath";

const testProps = {
  square1: {rowIndex: 7, columnIndex: 5, letter: "s"},
  square2: {rowIndex: 6, columnIndex: 4, letter: "m"},
  boardLocation: {rowHeight:38.6, columnWidth: 37.5},
};

describe('BoardDrawPath', () => {
  it('renders correctly', () => {
    const { unmount, toJSON } = render(<BoardDrawPath square1={testProps.square1} square2={testProps.square2} boardLocation={testProps.boardLocation} />);
    expect(toJSON()).toMatchSnapshot();
    unmount();
  });
});
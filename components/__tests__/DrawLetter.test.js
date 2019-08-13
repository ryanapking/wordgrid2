import React from 'react';
import DrawLetter from "../DrawLetter";

import { render } from 'react-native-testing-library';

describe("DrawLetter", () => {
  it('renders with letter and letter size', () => {
    const renderComponent = render(<DrawLetter letter="a" letterSize={25} />);
    expect(renderComponent.toJSON()).toMatchSnapshot();
  });

  it('renders without letterSize', () => {
    const renderComponent = render(<DrawLetter letter="q" />);
    expect (renderComponent.toJSON()).toMatchSnapshot();
  });

  it ('renders null without letter', () => {
    const renderComponent = render(<DrawLetter />);
    expect (renderComponent.toJSON()).toMatchSnapshot();
  });
});
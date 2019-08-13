import React from 'react';
import { render, fireEvent } from 'react-native-testing-library';

import AccountLoginForm from "../AccountLoginForm";

describe('AccountLoginForm', () => {
  test('formAction called with entered username and password', () => {
    const formActionProp = jest.fn((username, email) => {});

    const testUsername = "jim@fake.com";
    const testPassword = "passwordzzzzz";

    const renderedComponent = render(<AccountLoginForm formAction={formActionProp} />);

    const usernameInput = renderedComponent.getByTestId("usernameField");
    fireEvent.changeText(usernameInput, testUsername);

    const passwordInput = renderedComponent.getByTestId("passwordField");
    fireEvent.changeText(passwordInput, testPassword);

    const loginButton = renderedComponent.getByTestId("loginButton");
    fireEvent.press(loginButton);

    expect(formActionProp).toBeCalledWith(testUsername, testPassword);

    renderedComponent.unmount();

  });

});
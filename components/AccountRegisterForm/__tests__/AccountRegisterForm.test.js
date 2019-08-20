import React from 'react';
import {fireEvent, render} from 'react-native-testing-library';

import AccountRegisterForm from "..";

describe('AccountRegisterForm', () => {
  it('calls formAction on button press', () => {
    const testUsername = "jimjams";
    const testEmail = "jim@fake.com";
    const testPassword = "passwordzzzzzz";

    const formActionProp = jest.fn((email, username, password) => {});
    const renderedComponent = render(<AccountRegisterForm buttonText="Register" formAction={formActionProp}/>);

    const emailPasswordInput = renderedComponent.getByTestId('emailField');
    fireEvent.changeText(emailPasswordInput, testEmail);

    const usernameInput = renderedComponent.getByTestId("usernameField");
    fireEvent.changeText(usernameInput, testUsername);

    const retypePasswordInput = renderedComponent.getByTestId('retypePasswordField');
    fireEvent.changeText(retypePasswordInput, testPassword);

    const passwordInput = renderedComponent.getByTestId("passwordField");
    fireEvent.changeText(passwordInput, testPassword);

    const loginButton = renderedComponent.getByTestId("submitButton");
    fireEvent.press(loginButton);

    expect(formActionProp).toHaveBeenCalledWith(testEmail, testUsername, testPassword);
    renderedComponent.unmount();
  });

  it('displays invalid email message', () => {
    const testInvalidEmail = "jim@fake";
    const testEmail = "jim@fake.com";

    const formActionProp = jest.fn((email, username, password) => {});
    const renderedComponent = render(<AccountRegisterForm buttonText="Register" formAction={formActionProp}/>);

    const emailPasswordInput = renderedComponent.getByTestId('emailField');
    fireEvent.changeText(emailPasswordInput, testInvalidEmail);
    expect(emailPasswordInput.props.errorMessage).toEqual("invalid email address");

    fireEvent.changeText(emailPasswordInput, testEmail);
    expect(emailPasswordInput.props.errorMessage).toEqual(null);
  });

  it('disables submit when field values are invalid', () => {
    const testUsername = "jimjams";
    const testEmail = "jim@fake.com";
    const testPassword = "passwordzzzzzz";

    const formActionProp = jest.fn((email, username, password) => {});
    const renderedComponent = render(<AccountRegisterForm buttonText="Register" formAction={formActionProp}/>);

    const emailPasswordInput = renderedComponent.getByTestId('emailField');
    const usernameInput = renderedComponent.getByTestId("usernameField");
    const retypePasswordInput = renderedComponent.getByTestId('retypePasswordField');
    const passwordInput = renderedComponent.getByTestId("passwordField");
    const submitButton = renderedComponent.getByTestId("submitButton");

    // invalid email
    fireEvent.changeText(emailPasswordInput, "jim@fake");
    fireEvent.changeText(usernameInput, testUsername);
    fireEvent.changeText(retypePasswordInput, testPassword);
    fireEvent.changeText(passwordInput, testPassword);
    expect(submitButton.props.disabled).toBeTruthy();

    // missing username
    fireEvent.changeText(emailPasswordInput, testEmail);
    fireEvent.changeText(usernameInput, "");
    fireEvent.changeText(retypePasswordInput, testPassword);
    fireEvent.changeText(passwordInput, testPassword);
    expect(submitButton.props.disabled).toBeTruthy();

    // mismatched passwords
    fireEvent.changeText(emailPasswordInput, testEmail);
    fireEvent.changeText(usernameInput, testUsername);
    fireEvent.changeText(retypePasswordInput, testPassword);
    fireEvent.changeText(passwordInput, "nope!");
    expect(submitButton.props.disabled).toBeTruthy();

    renderedComponent.unmount();
  });

});
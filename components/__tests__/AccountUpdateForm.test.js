import React from 'react';
import { render, fireEvent } from "react-native-testing-library";
import * as redux from 'react-redux';

import AccountUpdateForm from "../AccountUpdateForm";
import * as userActionCreators from "../../data/redux/thunkedUserActions";

// values for testing
const initialEmail = "jimothy@fake.com";
const initialUsername = "jimothy";
const invalidEmail = "jennifer@fake";
const newEmail = "jimjim@fake.com";
const newUsername = "jimjim";
const newPassword = "pword1234";
const newWrongPassword = "pword2345";

// mock redux dispatch and useDispatch
const dispatchMock = jest.fn((object) => {});
const useDispatchSpy = jest.spyOn(redux, "useDispatch").mockImplementation( () => dispatchMock );

// mock updateAccount and userLogout action creators
const updateAccountSpy = jest.spyOn(userActionCreators, "updateAccount").mockImplementation((email, username, password) => {});
const userLogoutSpy = jest.spyOn(userActionCreators, "userLogout").mockImplementation(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AccountUpdateForm', () => {

  it('toggles form fields on lock icon press', () => {
    const { getByTestId, queryByTestId, unmount} = render(
      <AccountUpdateForm email={initialEmail} username={initialUsername} />
    );

    // get password field (it always exists but is sometimes locked)
    const passwordField = getByTestId('passwordField');

    const toggleAllFields = () => {
      fireEvent.press(getByTestId("usernameLockIcon"));
      fireEvent.press(getByTestId("emailLockIcon"));
      fireEvent.press(getByTestId("passwordLockIcon"));
    };

    const allFieldsExist = () => {
      let usernameField = queryByTestId("usernameField");
      let emailField = queryByTestId("emailField");
      let retypePasswordField = queryByTestId("retypePasswordField");

      return (passwordField.props.editable && !!usernameField && !!emailField && !!retypePasswordField);
    };

    expect(allFieldsExist()).toBe(false);
    toggleAllFields();
    expect(allFieldsExist()).toBe(true);
    toggleAllFields();
    expect(allFieldsExist()).toBe(false);

    unmount();
  });

  it('submits data to redux updateUser on button press', () => {
    const { getByTestId, unmount } = render(
      <AccountUpdateForm email={initialEmail} username={initialUsername} />
    );

    // unlock all fields
    fireEvent.press(getByTestId("usernameLockIcon"));
    fireEvent.press(getByTestId("emailLockIcon"));
    fireEvent.press(getByTestId("passwordLockIcon"));

    // set text in fields and submit
    fireEvent.changeText(getByTestId("usernameField"), newUsername);
    fireEvent.changeText(getByTestId("emailField"), newEmail);
    fireEvent.changeText(getByTestId("passwordField"), newPassword);
    fireEvent.changeText(getByTestId("retypePasswordField"), newPassword);
    fireEvent.press(getByTestId("submitButton"));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(updateAccountSpy).toHaveBeenCalledWith(newEmail, newUsername, newPassword);

    unmount();
  });

  it('validates email format', () => {
    const { getByTestId, unmount } = render(
      <AccountUpdateForm email={initialEmail} username={initialUsername} />
    );

    // enable email field and get value
    fireEvent.press(getByTestId("emailLockIcon"));

    const emailField = getByTestId("emailField");

    // should be no error message
    expect(emailField.props.errorMessage).toBeNull();

    fireEvent.changeText(emailField, invalidEmail);
    const submitButton = getByTestId("submitButton");

    // there should be an error message and submit button should be disabled
    expect(emailField.props.errorMessage.length).toBeGreaterThan(0);
    expect(submitButton.props.disabled).toBe(true);

    unmount();
  });

  it('hides submit button until needed', () => {
    const { queryByTestId, getByTestId, unmount } = render(
      <AccountUpdateForm email={initialEmail} username={initialUsername} />
    );
    expect(queryByTestId("submitButton")).toBeNull();
    fireEvent.press(getByTestId('usernameLockIcon'));
    expect(queryByTestId('submitButton')).not.toBeNull();

    unmount();
  });

  it('validates passwords match', () => {
    const { getByTestId, unmount } = render(
      <AccountUpdateForm email={initialEmail} username={initialUsername} />
    );

    // unlock password portion of form and get fields
    fireEvent.press(getByTestId('passwordLockIcon'));

    // set mismatched passwords
    fireEvent.changeText(getByTestId('passwordField'), newPassword);
    fireEvent.changeText(getByTestId('retypePasswordField'), newWrongPassword);

    // submit button should be disabled
    expect(getByTestId('submitButton').props.disabled).toBe(true);

    // correct mismatched passwords
    fireEvent.changeText(getByTestId('retypePasswordField'), newPassword);

    // submit button should be enabled
    expect(getByTestId('submitButton').props.disabled).toBe(false);

    unmount();
  });

  it('clears form field data on lock', () => {
    const { getByTestId, queryByTestId, unmount } = render(
      <AccountUpdateForm email={initialEmail} username={initialUsername} />
    );

    const toggleAllFields = () => {
      fireEvent.press(getByTestId("usernameLockIcon"));
      fireEvent.press(getByTestId("emailLockIcon"));
      fireEvent.press(getByTestId("passwordLockIcon"));
    };

    // enable fields and set values
    toggleAllFields();
    fireEvent.changeText(getByTestId("usernameField"), newUsername);
    fireEvent.changeText(getByTestId("emailField"), newEmail);
    fireEvent.changeText(getByTestId("passwordField"), newPassword);
    fireEvent.changeText(getByTestId("retypePasswordField"), newPassword);

    // lock then unlock fields
    toggleAllFields();
    toggleAllFields();

    // submit button should disabled because everything should have been reset on lock
    expect(queryByTestId('submitButton').props.disabled).toBe(true);

    unmount();
  });

  it('calls logout on button press', () => {
    const { getByTestId, unmount } = render(
      <AccountUpdateForm email={initialEmail} username={initialUsername} />
    );
    fireEvent.press(getByTestId('logoutButton'));
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(userLogoutSpy).toHaveBeenCalledTimes(1);

    unmount();
  });
});
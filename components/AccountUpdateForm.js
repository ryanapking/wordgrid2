import React, { useReducer } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Input } from "react-native-elements";
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import validator from 'validator';

import { updateAccount, userLogout } from "../data/redux/thunkedUserActions";

const initialState = {
  saving: false,
  updateUsername: false,
  updateEmail: false,
  updatePassword: false,
  newUsername: "",
  newEmail: "",
  newPassword: "",
  newRetypePassword: "",
};

const reducer = (state, action) => {
  switch(action.type) {
    case "setNewUsername":
      return { ...state, newUsername: action.newUsername };
    case "setNewEmail":
      return { ...state, newEmail: action.newEmail };
    case "setNewPassword":
      return { ...state, newPassword: action.newPassword };
    case "setNewRetypePassword":
      return { ...state, newRetypePassword: action.newRetypePassword };
    case "setUpdateUsername":
      return {
        ...state,
        updateUsername: action.updateUsername,
        newUsername: action.updateUsername ? state.newUsername : '',
      };
    case "setUpdateEmail":
      return {
        ...state,
        updateEmail: action.updateEmail,
        newEmail: action.updateEmail ? action.newEmail : '' ,
      };
    case "setUpdatePassword":
      return {
        ...state,
        updatePassword: action.updatePassword,
        newPassword: action.updatePassword ? state.newPassword : '',
        newRetypePassword: action.updatePassword ? state.newRetypePassword : '',
      };
    case "reset":
      return { ...initialState};
  }
};

const AccountUpdateForm = props => {
  const reduxDispatch = useDispatch();

  const [state, localDispatch] = useReducer(reducer, initialState);

  const saveChanges = () => {
    const { newEmail, newUsername, newPassword } = state;
    reduxDispatch(updateAccount(newEmail, newUsername, newPassword));
    localDispatch({ type: "reset" });
  };

  const { updateUsername, updateEmail, updatePassword, newUsername, newEmail, newPassword, newRetypePassword } = state;
  const { username, email } = props;

  const newEmailValid = (newEmail && validator.isEmail(newEmail));
  const newPasswordValid = (newPassword && newPassword === newRetypePassword);

  const formReady = (newEmail || newPassword || newUsername) && (!newEmail || newEmailValid) && (!newPassword || newPasswordValid);

  const lockIcons = {
    username: {
      type: 'MaterialCommunityIcons',
      name: updateUsername ? 'lock-open' : 'lock',
      onPress: () => {
        localDispatch({ type: "setUpdateUsername", updateUsername: !updateUsername });
      },
      testID: 'usernameLockIcon',
    },
    email: {
      type: 'MaterialCommunityIcons',
      name: updateEmail ? 'lock-open' : 'lock',
      onPress: () => {
        localDispatch({ type: "setUpdateEmail", updateEmail: !updateEmail });
      },
      testID: 'emailLockIcon',
    },
    password: {
      type: 'MaterialCommunityIcons',
      name: updatePassword ? 'lock-open' : 'lock',
      onPress: () => {
        localDispatch({ type: "setUpdatePassword", updatePassword: !updatePassword });
      },
      testID: 'passwordLockIcon',
    }
  };

  return (
    <View style={styles.mainView}>
      <View style={styles.fieldGroup}>
        <Input
          label='Username'
          value={username}
          editable={false}
          rightIcon={lockIcons.username}
        />
        { updateUsername ?
          <Input
            label='New Username'
            editable={true}
            textContentType="username"
            autoCapitalize="none"
            onChangeText={ (newUsername) => localDispatch({ type: "setNewUsername", newUsername }) }
            testID="usernameField"
          />
          : null
        }
      </View>
      <View style={styles.fieldGroup}>
        <Input
          label='Email Address'
          value={email}
          editable={false}
          rightIcon={lockIcons.email}
        />
        { updateEmail ?
          <Input
            label='New Email Address'
            errorMessage={ (newEmail && !validator.isEmail(newEmail)) ? 'Invalid email address' : null }
            editable={true}
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={ (newEmail) => localDispatch({ type: "setNewEmail", newEmail }) }
            testID="emailField"
          />
          : null
        }
      </View>
      <View style={styles.fieldGroup}>
        <Input
          label={ updatePassword ? "New Password" : "Password" }
          placeholder={ updatePassword ? null : "*********" }
          textContentType="password"
          autoCapitalize="none"
          editable={updatePassword}
          secureTextEntry={true}
          rightIcon={lockIcons.password}
          onChangeText={ (newPassword) => localDispatch({ type: "setNewPassword", newPassword }) }
          testID="passwordField"
        />
        { updatePassword ?
          <Input
            label="Retype New Password"
            textContentType="password"
            autoCapitalize="none"
            editable={true}
            secureTextEntry={true}
            onChangeText={ (newRetypePassword) => localDispatch({ type: "setNewRetypePassword", newRetypePassword }) }
            testID="retypePasswordField"
          />
          : null
        }
      </View>
      { (updateUsername || updateEmail || updatePassword) ?
        <View style={styles.button}>
          <Button
            disabled={!formReady}
            title="Save Changes"
            onPress={ () => saveChanges() }
            testID="submitButton"
          />
        </View>
        : null
      }
      <View style={styles.button}>
        <Button
          title="Log Out"
          onPress={ () => reduxDispatch(userLogout()) }
          testID="logoutButton"
        />
      </View>

    </View>
  );
};

AccountUpdateForm.propTypes = {
  email: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  fieldGroup: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default AccountUpdateForm;
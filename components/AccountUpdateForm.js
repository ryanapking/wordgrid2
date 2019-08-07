import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Input } from "react-native-elements";
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import validator from 'validator';

import AccountLogoutButton from './AccountLogoutButton';
import { updateAccount } from "../data/redux/thunkedUserActions";

const AccountUpdateForm = props => {
  const dispatch = useDispatch();
  const initialState = {
    updateUsername: false,
    updateEmail: false,
    updatePassword: false,
    newUsername: "",
    newEmail: "",
    newPassword: "",
    newRetypePassword: "",
    saving: false,
  };

  const [state, setState] = useState(initialState);

  const stateMerge = (stateUpdates) => {
    const newState = {
      ...state,
      ...stateUpdates,
    };
    setState(newState);
  };

  const saveChanges = () => {
    const { newEmail, newUsername, newPassword, newRetypePassword } = state;
    if (newEmail && !validator.isEmail(newEmail)) return;
    if (newPassword && newPassword !== newRetypePassword) return;
    dispatch(updateAccount(newEmail, newUsername, newPassword));
    setState(initialState);
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
        stateMerge({ updateUsername: true });
      },
    },
    email: {
      type: 'MaterialCommunityIcons',
      name: updateEmail ? 'lock-open' : 'lock',
      onPress: () => {
        stateMerge({ updateEmail: true });
      },
    },
    password: {
      type: 'MaterialCommunityIcons',
      name: updatePassword ? 'lock-open' : 'lock',
      onPress: () => {
        stateMerge({ updatePassword: true });
      },
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
            onChangeText={ (newUsername) => stateMerge({newUsername}) }
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
            onChangeText={ (newEmail) => stateMerge({newEmail}) }
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
          onChangeText={ (newPassword) => stateMerge({newPassword}) }
        />
        { updatePassword ?
          <Input
            label="Retype New Password"
            textContentType="password"
            autoCapitalize="none"
            editable={true}
            secureTextEntry={true}
            onChangeText={ (newRetypePassword) => stateMerge({newRetypePassword}) }
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
          />
        </View>
        : null
      }
      <View style={styles.button}>
        <AccountLogoutButton />
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
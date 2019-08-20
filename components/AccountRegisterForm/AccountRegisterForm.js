import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { Input } from "react-native-elements";
import validator from 'validator';
import PropTypes from 'prop-types';

const AccountRegisterForm = props => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');

  const passwordsMatch = (password && password === retypePassword);
  const emailValid = (!email || validator.isEmail(email));

  return (
    <View style={{width: '100%'}}>
      <Input
        errorMessage={emailValid ? null : "invalid email address"}
        label="Email Address"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={ email => setEmail(email) }
        testID="emailField"
      />
      <Input
        label="Username"
        textContentType="username"
        autoCapitalize="none"
        onChangeText={ username => setUsername(username) }
        testID="usernameField"
      />
      <Input
        label="Password"
        textContentType="password"
        autoCapitalize="none"
        secureTextEntry
        onChangeText={ password => setPassword(password) }
        testID="passwordField"
      />
      <Input
        label="Retype Password"
        textContentType="password"
        autoCapitalize="none"
        secureTextEntry
        onChangeText={ retypePassword => setRetypePassword(retypePassword) }
        testID="retypePasswordField"
      />
      <Button
        disabled={!passwordsMatch || !username || !email || !emailValid}
        title={props.buttonText}
        onPress={ () => props.formAction(email, username, password) }
        testID="submitButton"
      />
    </View>
  );
};

AccountRegisterForm.propTypes = {
  buttonText: PropTypes.string.isRequired,
  formAction: PropTypes.func.isRequired,
};

export default AccountRegisterForm;
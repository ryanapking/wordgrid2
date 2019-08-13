import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { Input } from "react-native-elements";
import PropTypes from 'prop-types';

const AccountLoginForm = props => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={{width: '100%'}}>
      <Input
        label="Username or Email"
        autoCapitalize="none"
        onChangeText={ username => setUsername(username) }
        testID="usernameField"
      />
      <View style={{ marginTop: 10, marginBottom: 10 }}>
        <Input
          label="Password"
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={ password => setPassword(password) }
          testID="passwordField"
        />
      </View>
      <Button
        disabled={!username || !password}
        title="Login"
        onPress={ () => props.formAction(username, password) }
        testID="loginButton"
      />
    </View>
  );
};

AccountLoginForm.propTypes = {
  formAction: PropTypes.func.isRequired,
};

export default AccountLoginForm;
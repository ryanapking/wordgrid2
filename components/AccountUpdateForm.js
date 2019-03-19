import React, { Component } from 'react';
import { View, Button } from 'react-native';
import { Input } from "react-native-elements";
import PropTypes from 'prop-types';
import validator from 'validator';

import { updateExistingAccount } from "../data/parse-client/user";

export default class AccountUpdateForm extends Component {
  constructor() {
    super();

    this.state = {
      updateUsername: false,
      updateEmail: false,
      updatePassword: false,

      newUsername: "",
      newEmail: "",
      newPassword: "",
      newRetypePassword: "",

      saving: false,
    };

  }
  render() {
    const { updateUsername, updateEmail, updatePassword } = this.state;

    return (
      <View style={{width: '100%'}}>
        { this.emailField(updateEmail) }
        { this.usernameField(updateUsername) }
        { this.passwordField(updatePassword) }
        <Button
          disabled={true}
          title="Update Account"
          onPress={ () => console.log('button pressed') }
        />
      </View>
    );
  }

  enableField(fieldName) {
    this.setState({
      updateUsername: (fieldName === 'username'),
      updateEmail: (fieldName === 'email'),
      updatePassword: (fieldName === 'password'),
    });
  }

  emailField(enabled = false) {
    const { email } = this.props;
    return (
      <View>
        <Input
          value={email}
          editable={false}
          label="Email Address"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={ (newEmail) => this.setState({newEmail}) }
        />
        { enabled ?
          <Button title={"Save Email Address"} onPress={ () => console.log('saving email address...') }/>
          :
          <Button title="Update Email Address" onPress={ () => this.enableField("email") } />
        }
      </View>
    );
  }

  usernameField(enabled = false) {
    const { username } = this.props;
    return (
      <View>
        <Input
          label="Username"
          value={username}
          editable={false}
          textContentType="username"
          autoCapitalize="none"
          onChangeText={ (newUsername) => this.setState({newUsername}) }
        />
        { enabled ?
          <Button title={"Save Username"} onPress={ () => console.log('saving username...') }/>
          :
          <Button title="Update Username" onPress={ () => this.enableField("username") } />
        }
      </View>
    );
  }

  passwordField(enabled = false) {
    return (
      <View>
        <Input
          label="Password"
          textContentType="password"
          autoCapitalize="none"
          editable={false}
          secureTextEntry={true}
          onChangeText={ (newPassword) => this.setState({newPassword}) }
        />
        { enabled ?
          <View>
            <Input
              label="Retype Password"
              textContentType="password"
              autoCapitalize="none"
              editable={false}
              secureTextEntry={true}
              onChangeText={ (newRetypePassword) => this.setState({newRetypePassword}) }
            />
            <Button title={"Save Password"} onPress={ () => console.log('saving password...') }/>
          </View>
          :
          <Button title="Change Password" onPress={ () => this.enableField("password") } />
        }
      </View>
    );
  }

  saveChanges() {
    const { newEmail, newUsername, newPassword, newRetypePassword } = this.state;

    if (newEmail && !validator.isEmail(newEmail)) return;
    if (newPassword && newPassword !== newRetypePassword) return;

    this.setState({ saving: true });

    updateExistingAccount(newEmail, newUsername, newPassword)
      .then( () => {
        // trigger parent element to get user data, which should be updated
        this.props.accountUpdated();
      })
      .catch( (err) => {
        // we should output this error somewhere. maybe an overlay at the app level.
      })
      .finally( () => {
        this.setState({ saving: false });
      });

  }

  static propTypes = {
    email: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    accountUpdated: PropTypes.func.isRequired,
  }
}
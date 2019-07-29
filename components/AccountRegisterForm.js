import React, { Component } from 'react';
import { View, Button } from 'react-native';
import { Input } from "react-native-elements";
import validator from 'validator';
import PropTypes from 'prop-types';

export default class AccountRegisterForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      email: "",
      password: "",
      retypePassword: "",
    };
  }
  render() {

    // form action will either be to create an account or update existing anonymous account with new data
    const { formAction, buttonText } = this.props;

    const { email, username, password, retypePassword } = this.state;

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
          onChangeText={ (email) => this.setState({email}) }
        />
        <Input
          label="Username"
          textContentType="username"
          autoCapitalize="none"
          onChangeText={ (username) => this.setState({username}) }
        />
        <Input
          label="Password"
          textContentType="password"
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={ (password) => this.setState({password}) }
        />
        <Input
          label="Retype Password"
          textContentType="password"
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={ (retypePassword) => this.setState({retypePassword}) }
        />
        <Button
          disabled={!passwordsMatch || !username || !email || !emailValid}
          title={buttonText}
          onPress={ () => formAction(email, username, password) }
        />
      </View>
    );
  }

  static propTypes = {
    buttonText: PropTypes.string.isRequired,
    formAction: PropTypes.func.isRequired,
  }

}
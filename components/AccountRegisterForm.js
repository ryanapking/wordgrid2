import React, { Component } from 'react';
import { View, Button } from 'react-native';
import { Input } from "react-native-elements";
import { connect } from 'react-redux';
import validator from 'validator';

import { userCreateAccount } from "../data/redux/user";

class AccountRegisterForm extends Component {
  constructor() {
    super();

    this.state = {
      username: "",
      email: "",
      password: "",
      retypePassword: "",
    };
  }
  render() {

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
          title="Create Account"
          onPress={ () => this.props.userCreateAccount(email, username, password) }
        />
      </View>
    );
  }

}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  userCreateAccount,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountRegisterForm);
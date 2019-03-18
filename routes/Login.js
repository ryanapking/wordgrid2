import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { Input } from 'react-native-elements';

import { userAnonymousLogin, userStandardLogin } from '../data/redux/user';
import AccountLoginForm from '../components/AccountLoginForm';

class Login extends Component {
  constructor() {
    super();

    this.state = {
      username: "",
      password: "",
    };
  }

  render() {

    console.log('state:', this.state);

    return (
      <View style={loginStyles.container}>
        <Button
          title="Login Anonymously"
          onPress={ () => this.props.userAnonymousLogin() }
        />
        <AccountLoginForm />
      </View>
    );
  }
}

const loginStyles = StyleSheet.create({
  container: {
    // backgroundColor: '#5b7aff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
});

const mapStateToProps = () => {
  return {

  };
};

const mapDispatchToProps = {
  userAnonymousLogin,
  userStandardLogin,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
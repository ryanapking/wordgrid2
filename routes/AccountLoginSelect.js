import React, { Component } from "react";
import { StyleSheet, Text, View, Button, ActivityIndicator } from "react-native";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { userAnonymousLogin, userCreateAccount } from '../data/redux/user';
import AccountLoginForm from '../components/AccountLoginForm';
import AccountRegisterForm from '../components/AccountRegisterForm';

class AccountLoginSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayForm: null
    };
  }

  render() {
    const { displayForm } = this.state;
    const { fetchingUser } = this.props;

    if ( fetchingUser ) {
      return this.activityIndicator();
    } else if ( displayForm === "standard" ) {
      return this.standardLoginForm();
    } else if ( displayForm === "createAccount") {
      return this.createAccountForm();
    } else if ( displayForm === "anonymous") {
      return this.anonymousLoginForm();
    } else {
      return this.loginFormSelector();
    }
  }

  standardLoginForm() {
    return (
      <View style={loginStyles.container}>
        <AccountLoginForm />
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button title="Cancel" onPress={ () => this.setState({ displayForm: null })} />
        </View>
      </View>
    );
  }

  createAccountForm() {
    return (
      <View style={loginStyles.container}>
        <AccountRegisterForm buttonText="Create Account" formAction={ (email, username, password) => this.props.userCreateAccount(email, username, password, this.props.history)} />
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button title="Cancel" onPress={ () => this.setState({ displayForm: null })} />
        </View>
      </View>
    );
  }

  anonymousLoginForm() {
    return (
      <View style={loginStyles.container}>
        <Text>Your games will be saved on this phone until your account is registered. Would you like to continue?</Text>
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button title="Login Anonymously" onPress={ () => this.props.userAnonymousLogin(this.props.history)} />
        </View>
        <Button title="Cancel" onPress={ () => this.setState({ displayForm: null })} />
      </View>
    );
  }

  loginFormSelector() {
    return (
      <View style={loginStyles.container}>
        <Button
          title="Login with Username & Password"
          onPress={ () => this.setState({ displayForm: "standard" })}
        />
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button
            title="Create Account"
            onPress={ () => this.setState({ displayForm: "createAccount" })}
          />
        </View>
        <Button
          title="Login Anonymously"
          onPress={ () => this.setState({ displayForm: "anonymous" })}
        />
      </View>
    );
  }

  activityIndicator() {
    return (
      <View style={loginStyles.indicator}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const loginStyles = StyleSheet.create({
  container: {
    // backgroundColor: '#5b7aff',
    // alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
  indicator: {
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  }
});

const mapStateToProps = (state) => {
  return {
    fetchingUser: state.user.fetchingUser,
  };
};

const mapDispatchToProps = {
  userAnonymousLogin,
  userCreateAccount,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountLoginSelect));
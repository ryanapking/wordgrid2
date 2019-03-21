import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';

import { getCurrentUser } from "../data/parse-client/user";
import AccountUpdateForm from '../components/AccountUpdateForm';

export default class Account extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      fetchingUser: true,
    };

    this.fetchAccountInfo();
  }

  render() {
    const { user, fetchingUser } = this.state;

    if (fetchingUser) {
      return this.fetchingMessage();
    } else if (user._isLinked('anonymous')) {
      return this.anonymousUserMessage();
    } else {
      return this.userInfo();
    }
  }

  userInfo() {
    const { user } = this.state;
    return (
      <AccountUpdateForm
        email={user.get('email')}
        username={user.get('username')}
        accountUpdated={ () => this.fetchAccountInfo() }
      />
    );
  }

  anonymousUserMessage() {
    return (
      <View>
        <Text>You are logged in anonymously. All data is stored on this phone, and if you are logged out, you will have no way to retrieve it. Consider registering your account. Your existing games will come with you.</Text>
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button title="Log Out" onPress={ () => console.log('this is where a message will pop up warning the user') } />
        </View>
        <Button title="Register Account" onPress={ () => console.log('This will direct the user to the register screen') } />
      </View>
    );
  }

  fetchingMessage() {
    return (
      <View>
        <Text>Fetching user info...</Text>
      </View>
    );
  }

  fetchAccountInfo() {
    console.log('fetching account info');
    getCurrentUser()
      .then( (user) => {
        this.setState({ user, fetchingUser: false });
      })
      .catch( (err) => {
        console.log('error getting current user:', err);
        // we should just redirect here. the user is not logged in.
        // fetching is a local process, so it's not a matter of internet connectivity
      });
  }
}
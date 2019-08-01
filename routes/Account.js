import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import routes from '.';
import { setInfoMessage, setErrorMessage } from "../data/redux/messages";
import { getCurrentUser } from "../data/parse-client/user";
import AccountUpdateForm from '../components/AccountUpdateForm';
import AccountLogoutButton from '../components/AccountLogoutButton';
import AccountRegisterForm from '../components/AccountRegisterForm';

import { convertAnonymousAccount } from "../data/parse-client/user";

class Account extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      fetchingUser: true,
      logoutConfirmationDisplayed: false,
      registerAccount: false,
    };

    this.fetchAccountInfo();
  }

  render() {
    const { user, fetchingUser } = this.state;

    if (fetchingUser) {
      return this.fetchingMessage();
    } else if (user && user._isLinked('anonymous')) {
      return this.anonymousUserMessage();
    } else if (user) {
      return this.userInfo();
    } else {
      return null;
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
    const { logoutConfirmationDisplayed, registerAccount } = this.state;

    const logoutConfirmMessage = 'Your account has not been registered. Logging out now will lose all game data. You will not have any way to log back in. Please register your account. After dismissing this message, either cancel your logout request or confirm.';

    const confirmLogout = () => {
      this.props.setInfoMessage(logoutConfirmMessage);
      this.setState({ logoutConfirmationDisplayed: true });
    };

    if (registerAccount) {
      return (
        <AccountRegisterForm
          buttonText="Register Account"
          formAction={ (email, username, password) => this.convertAnonymousAccount(email, username, password) }
        />
      );
    } else {
      return (
        <View>
          <Text>You are logged in anonymously. All data is stored on this phone, and if you are logged out, you will have no way to retrieve it. Consider registering your account. Your existing games will come with you.</Text>
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <AccountLogoutButton title={ logoutConfirmationDisplayed ? "Logout and Lose Data" : null } onPress={ logoutConfirmationDisplayed ? null : confirmLogout }/>
          </View>
          { logoutConfirmationDisplayed
            ? <Button title="Cancel Logout" onPress={ () => this.setState({ logoutConfirmationDisplayed: false })} />
            : <Button title="Register Account" onPress={ () => this.props.history.push(routes.accountConvertAnonymous.path) } />
          }
        </View>
      );
    }


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

  convertAnonymousAccount(email, username, password) {
    convertAnonymousAccount(email, username, password)
      .then( () => {
        this.setState({ fetchingUser: true });
        this.fetchAccountInfo();
      })
      .catch( (err) => {
        this.props.setErrorMessage(err.toString());
      });
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  setInfoMessage,
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Account));
import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import routes from "./index";
import AccountLogoutButton from "../components/containers/AccountLogoutButton";
import { setInfoMessage } from "../data/redux/messages";

class AccountAnonymous extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logoutConfirmationDisplayed: false,
    };
  }

  render() {
    const { logoutConfirmationDisplayed } = this.state;
    return (
      <View>
        <Text>You are logged in anonymously. All data is stored on this phone, and if you are logged out, you will have no way to retrieve it. Consider registering your account. Your existing games will come with you.</Text>
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <AccountLogoutButton
            title={ logoutConfirmationDisplayed ? "Logout and Lose Data" : null }
            onPress={ logoutConfirmationDisplayed ? null : () => this.confirmLogout() }
          />
        </View>
        { logoutConfirmationDisplayed
          ? <Button title="Cancel Logout" onPress={ () => this.setState({ logoutConfirmationDisplayed: false })} />
          : <Button title="Register Account" onPress={ () => this.props.history.push(routes.accountConvertAnonymous.path) } />
        }
      </View>
    );
  }

  confirmLogout() {
    const logoutConfirmMessage = 'Your account has not been registered. Logging out now will lose all game data. You will not have any way to log back in. Please register your account. After dismissing this message, either cancel your logout request or confirm.';

    this.props.setInfoMessage(logoutConfirmMessage);
    this.setState({ logoutConfirmationDisplayed: true });
  };
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  setInfoMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountAnonymous));
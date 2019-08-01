import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { convertAnonymousAccount } from "../data/parse-client/user";
import AccountRegisterForm from "../components/AccountRegisterForm";

class AccountConvertAnonymous extends Component {
  render() {
    return (
      <View style={styles.container}>
        <AccountRegisterForm
          buttonText="Register Account"
          formAction={ (email, username, password) => this.convertAnonymousAccount(email, username, password) }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
});

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  convertAnonymousAccount,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountConvertAnonymous));
import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import routes from '.';
import { userCreateAccount } from "../data/redux/user";
import AccountRegisterForm from "../components/AccountRegisterForm";

class AccountCreate extends Component {
  render() {
    return(
      <View style={styles.container}>
        <AccountRegisterForm
          buttonText="Create Account"
          formAction={ (email, username, password) => this.props.userCreateAccount(email, username, password, this.props.history)}
        />
        <View style={styles.buttonSection}>
          <Button title="Cancel" onPress={ () => this.props.history.push(routes.accountLoginSelect.path)} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
  buttonSection: {
    marginTop: 10,
    marginBottom: 10,
  },
});

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  userCreateAccount,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountCreate));
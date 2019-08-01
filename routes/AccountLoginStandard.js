import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';

import AccountLoginForm from "../components/AccountLoginForm";
import routes from '.';

class AccountLoginStandard extends Component {
  render() {
    return (
      <View style={styles.container}>
        <AccountLoginForm />
        <View style={styles.buttonSection}>
          <Button title="Cancel" onPress={ () => this.props.history.push(routes.accountLoginSelect.path) } />
        </View>
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
  buttonSection: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default withRouter(AccountLoginStandard)
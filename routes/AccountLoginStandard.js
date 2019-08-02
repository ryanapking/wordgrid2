import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';

import AccountLoginForm from "../components/presentation/AccountLoginForm";
import routes from '.';
import { userStandardLogin } from "../data/redux/user";

class AccountLoginStandard extends Component {
  render() {
    return (
      <View style={styles.container}>
        <AccountLoginForm
          formAction={ (username, password) => this.props.userStandardLogin(username, password, this.props.history) }
        />
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

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  userStandardLogin,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountLoginStandard));
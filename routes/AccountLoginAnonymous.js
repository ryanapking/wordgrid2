import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import routes from '.';
import Text from "../components/presentation/Text";
import { userAnonymousLogin } from "../data/redux/thunkedUserActions";

class AccountLoginAnonymous extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text centered>Your games will be saved on this phone until your account is registered. Would you like to continue?</Text>
        <View style={styles.buttonSection}>
          <Button title="Login Anonymously" onPress={ () => this.props.userAnonymousLogin(this.props.history)} />
        </View>
        <Button title="Cancel" onPress={ () => this.props.history.push(routes.accountLoginSelect.path)} />
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
  userAnonymousLogin,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountLoginAnonymous));
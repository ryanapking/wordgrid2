import React, { Component } from "react";
import { StyleSheet, View, Button, ActivityIndicator } from "react-native";
import { withRouter } from 'react-router-native';

import routes from '.';

class AccountLoginSelect extends Component {
  render() {
    const { fetchingUser } = this.props;

    if (fetchingUser) {
      // TODO: This is never triggered. Fix Redux.
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Button
          title="Login with Username & Password"
          onPress={ () => this.props.history.push(routes.accountLoginStandard.path)}
        />
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button
            title="Create Account"
            onPress={ () => this.props.history.push(routes.accountCreate.path)}
          />
        </View>
        <Button
          title="Login Anonymously"
          onPress={ () => this.props.history.push(routes.accountLoginAnonymous.path)}
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

export default withRouter(AccountLoginSelect);
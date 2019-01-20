import React, { Component } from "react";
import {StyleSheet, Text, View} from "react-native";
import { Button, Container } from "native-base";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { userLogin } from '../data/redux/user';

class Login extends Component {
  render() {
    return (
      <Container style={loginStyles.container}>
        <Button block danger onPress={this.props.userLogin}>
          <Text>Login</Text>
        </Button>
      </Container>
    );
  }
}

const loginStyles = StyleSheet.create({
  container: {
    backgroundColor: '#5b7aff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});

const mapStateToProps = () => {
  return {

  };
};

const mapDispatchToProps = {
  userLogin
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
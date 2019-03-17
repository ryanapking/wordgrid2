import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { userLogin } from '../data/redux/user';

class Login extends Component {
  render() {
    return (
      <View style={loginStyles.container}>
        <Button
          title="Log In"
          type="solid"
          onPress={this.props.userLogin}
        />
      </View>
    );
  }
}

const loginStyles = StyleSheet.create({
  container: {
    // backgroundColor: '#5b7aff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
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
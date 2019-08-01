import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

class AccountAnonymous extends Component {
  render() {
    return (
      <View>
        <Text>AccountAnonymous.js</Text>
      </View>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {

};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountAnonymous));
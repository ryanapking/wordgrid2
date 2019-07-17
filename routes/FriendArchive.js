import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { withRouter } from 'react-router-native';

class FriendArchive extends Component {
  render() {
    return (
      <View>
        <Text>FriendArchive.js</Text>
      </View>
    );
  }
}

export default withRouter(FriendArchive);
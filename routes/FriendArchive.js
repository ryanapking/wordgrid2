import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { withRouter } from 'react-router-native';

class FriendArchive extends Component {
  render() {
    console.log('FriendArchive.js');
    return (
      <Text>FriendArchive.js</Text>
    );
  }
}

export default withRouter(FriendArchive);
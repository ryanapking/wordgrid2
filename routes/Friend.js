import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

class Friend extends Component {
  render() {
    const { friend } = this.props;
    return (
      <View>
        <Text>{ friend.username }</Text>
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const friendID = ownProps.match.params.friendID;
  const friend = state.user.friendsByID[friendID];
  return {
    friendID,
    friend,
  };
};

export default withRouter(connect(mapStateToProps)(Friend));
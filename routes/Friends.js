import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from 'react-native-elements';

import { refreshLocalFriendsData } from "../data/redux/user";

class Friends extends Component {
  componentDidMount() {
    // see if our local friends data contains all our friends, refresh if it doesn't
    const { friends, friendsByID } = this.props;
    const friendsByIDKeys = Object.keys(friendsByID);
    let shouldRefreshFriends = false;
    friends.forEach((friendID) => {
      if (!shouldRefreshFriends && !friendsByIDKeys.includes(friendID)) shouldRefreshFriends = true;
    });
    if (shouldRefreshFriends) this.props.refreshLocalFriendsData();
  }

  render() {
    const { friendsByID } = this.props;
    const friendsByIDKeys = Object.keys(friendsByID);
    return (
      <View>
        {friendsByIDKeys.map((friendID) =>
          <ListItem
            key={ friendID }
            title={ friendsByID[friendID].username }
            onPress={ () => this.props.history.push(`/friend/${friendID}`) }
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    friends: state.user.friends,
    friendsByID: state.user.friendsByID,
  }
};

const mapDispatchToProps = {
  refreshLocalFriendsData,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Friends));
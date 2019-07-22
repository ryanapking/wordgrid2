import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from 'react-native-elements';

class Friends extends Component {
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

};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Friends));
import React, { Component } from 'react';
import { View } from 'react-native';
import { connect, useSelector, shallowEqual } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from 'react-native-elements';

import { useHistory } from "../hooks/tempReactRouter";

const Friends = () => {
  const history = useHistory();
  const friendsByID = useSelector(state => state.user.friendsByID, shallowEqual);
  const friendsByIDKeys = Object.keys(friendsByID);
  return (
    <View>
      {friendsByIDKeys.map((friendID) =>
        <ListItem
          key={ friendID }
          title={ friendsByID[friendID].username }
          onPress={ () => history.push(`/friend/${friendID}`) }
        />
      )}
    </View>
  );
};

export default Friends;
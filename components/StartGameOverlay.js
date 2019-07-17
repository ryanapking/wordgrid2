import React, { Component } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { Overlay, Input, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';

import { startGame } from "../data/parse-client/actions";
import { getUsersByPartialString } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";
import { refreshLocalFriendsData } from "../data/redux/user";

class StartGameOverlay extends Component {
  constructor() {
    super();

    this.state = {
      showOverlay: false,
      searchByUserID: false,
      viewFriends: false,

      possibleOpponents: [],
    };
  }

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
    const { showOverlay, searchByUserID, viewFriends, possibleOpponents } = this.state;
    const { friendsByID } = this.props;
    const friendsByIDKeys = Object.keys(friendsByID);

    return (
      <View>
        <Button title="Start a new Game" onPress={ () => this.setState({ showOverlay: true })} />
        <Overlay
          isVisible={ showOverlay }
          onBackdropPress={ () => this.setState({ showOverlay: false, viewFriends: false, searchByUserID: false, possibleOpponents: [] }) }
        >
          <View>
            {(searchByUserID || viewFriends) ? null :
              <View style={styles.buttonSection}>
                <Button title="Random Opponent" onPress={ () => this._startGame() } />
                <View style={styles.buttonSpacer}>
                  <Button title="Play a Friend" onPress={ () => this.setState({ viewFriends: true }) } />
                </View>
                <Button title="Find by Username" onPress={ () => this.setState({ searchByUserID: true }) } />
              </View>
            }
            { searchByUserID ?
              <Input
                label="Username"
                autoCapitalize="none"
                onChangeText={ (searchString) => this._searchForUsers(searchString) }
              />
              : null
            }
            { viewFriends ?
              <View>
                <ListItem title="Your Friends" />
                { friendsByIDKeys.map( (friendID, index) =>
                  <ListItem
                    key={ friendID }
                    title={ friendsByID[friendID].username }
                    onPress={ () => this._startGame( friendsByID[friendID].id ) }
                  />
                )}
              </View>
              : null
            }
            { possibleOpponents.map( (user, index) =>
              <ListItem
                title={ user.username }
                key={index}
                onPress={ () => this._startGame(user.id) }
              />
            )}
          </View>
        </Overlay>
      </View>
    );
  }

  _searchForUsers(searchString) {
    getUsersByPartialString(searchString, this.props.uid)
      .then( (users) => {
        console.log('user search response:', users);
        const simpleUsersObject = users.map( (user) => {
          return {
            username: user.get('username'),
            id: user.id,
          };
        });
        this.setState({ possibleOpponents: simpleUsersObject })
      })
      .catch( (err) => {
        this.props.setErrorMessage(err);
      });
  }

  _startGame(opponentID = null) {
    startGame(opponentID)
      .catch( (err) => {
        this.props.setErrorMessage(err);
      });
  }
}

const styles = StyleSheet.create({
  buttonSection: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  buttonSpacer: {
    marginTop: 10,
    marginBottom: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    uid: state.user.uid,
    friends: state.user.friends,
    friendsByID: state.user.friendsByID,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
  refreshLocalFriendsData,
};

export default connect(mapStateToProps, mapDispatchToProps)(StartGameOverlay);
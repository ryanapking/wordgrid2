import React, { Component } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { Overlay, Input, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';

import { startGame } from "../data/parse-client/actions";
import { getUsersByPartialString, getFriendsByID } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";

class StartGameOverlay extends Component {
  constructor() {
    super();

    this.state = {
      showOverlay: false,
      searchByUserID: false,
      viewFriends: false,

      possibleOpponents: [],
      friends: [],
    };
  }

  render() {
    const { showOverlay, searchByUserID, viewFriends, possibleOpponents, friends } = this.state;

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
                  <Button title="Play a Friend" onPress={ () => this._getFriendsByID() } />
                </View>
                <Button title="Find by Username" onPress={ () => this.setState({ searchByUserID: true })} />
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
                { friends.map( (friend, index) =>
                  <ListItem
                    title={ friend.username }
                    key={ index }
                    onPress={ () => this._startGame(friend.uid) }
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

  _getFriendsByID() {
    this.setState({ viewFriends: true });
    const { friendIDs } = this.props;
    if (!friendIDs) return;

    getFriendsByID(friendIDs)
      .then((friends) => {
        this.setState({
          friends: friends.map((friend) => {
            return {
              uid: friend.id,
              username: friend.get('username'),
            };
          }),
        });
      })
      .catch((err) => {
        this.props.setErrorMessage(err);
      });
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
    friendIDs: state.user.friends,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(StartGameOverlay);
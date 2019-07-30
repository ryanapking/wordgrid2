import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { resetLocalGameDataByID } from "../data/redux/gameData";
import { refreshLocalUserInfo } from "../data/redux/user";
import { setErrorMessage } from "../data/redux/messages";
import { addFriend, forfeitGame } from "../data/parse-client/actions";

class Menu extends Component {

  render() {
    return (
      <View style={styles.container}>
        { this.gameMenuItems() }
        { this.globalMenuItems() }
      </View>
    );
  }

  globalMenuItems() {
    return (
      <View>
        <ListItem title="Navigate" containerStyle={styles.divider} />
        <ListItem title="Games" onPress={() => this.navigateTo(`/`)} />
        <ListItem title="Account" onPress={() => this.navigateTo('/account')} />
        <ListItem title="Friends" onPress={() => this.navigateTo('/friends')} />
      </View>
    )
  }

  gameMenuItems() {
    const { game, gameID, friends } = this.props;
    if (!game) return null;

    const isFriend = friends.includes(game.opponent.id);

    return (
      <View>
        <ListItem title="Game Actions" containerStyle={styles.divider} />
        <ListItem title="Reset Move" onPress={ () => this.resetGameData(gameID) } />
        <ListItem title="Forfeit Game" onPress={ () => this._forfeitGame(gameID) } />
        { isFriend ? null :
          <ListItem
            title="Add Friend"
            titleStyle={game.opponent.id ? {} : styles.disabledTitle}
            onPress={ () => this._addFriend(game.opponent.id) }
            disabled={!game.opponent.id}
          />
        }
      </View>
    );
  }

  _forfeitGame(gameID) {
    forfeitGame(gameID)
      .catch( (err) => {
        this.props.setErrorMessage(err.toString());
      });
  }

  // adds a friend to the remote list and triggers a local refresh
  _addFriend(friendID) {
    addFriend(friendID)
      .then(() => {
        this.props.refreshLocalUserInfo();
      })
      .catch((err) => {
        this.props.setErrorMessage(err);
      });
  }

  resetGameData(gameID) {
    this.props.resetLocalGameDataByID(gameID);
    this.props.closeNavMenu();
  }

  navigateTo(route) {
    this.props.closeNavMenu();
    this.props.history.push(route);
  }

  static propTypes = {
    closeNavMenu: PropTypes.func.isRequired
  }
}

const styles = StyleSheet.create({
  navItem: {

  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  disabledTitle: {
    color: 'lightgray',
  },
  divider: {
    backgroundColor: 'lightgray',
  },
});

const mapStateToProps = (state, ownProps) => {
  const { pathname } = ownProps.location;
  let gameID, game = null;
  if (pathname.startsWith('/game/')) {
    gameID = pathname.replace('/game/', '');
    game = state.gameData.byID[gameID];
  }

  console.log('user:', state.user);

  return {
    gameID,
    game,
    friends: state.user.friends,
  };
};

const mapDispatchToProps = {
  resetLocalGameDataByID,
  setErrorMessage,
  refreshLocalUserInfo,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Menu));
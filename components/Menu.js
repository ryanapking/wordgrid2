import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { resetLocalGameDataByID } from "../data/redux/gameData";
import { setErrorMessage } from "../data/redux/messages";
import { addFriend, forfeitGame } from "../data/parse-client/actions";

class Menu extends Component {

  render() {
    return (
      <View style={styles.container}>
        {this.gameMenuItems()}
        <ListItem title="Games" onPress={() => this.navigateTo(`/games`)} />
        <ListItem title="Account" onPress={() => this.navigateTo('/account')} />
      </View>
    );
  }

  gameMenuItems() {
    const { game, gameID } = this.props;

    if (game) {
      return (
        <View>
          <ListItem title="Reset Move" onPress={ () => this.resetGameData(gameID) } />
          <ListItem title="Forfeit Game" onPress={ () => this._forfeitGame(gameID) } />
          <ListItem title="Add Friend" onPress={ () => this._addFriend(game.opponent.id) } />
        </View>
      );
    } else {
      return null;
    }

  }

  _forfeitGame(gameID) {
    forfeitGame(gameID)
      .catch( (err) => {
        this.props.setErrorMessage(err.toString());
      });
  }

  _addFriend(friendID) {
    addFriend(friendID)
      .then((response) => {

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
  }
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
  };
};

const mapDispatchToProps = {
  resetLocalGameDataByID,
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Menu));
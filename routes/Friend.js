import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from 'react-native-elements';

import { getGamesAgainstOpponent } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";

class Friend extends Component {
  constructor() {
    super();
    this.state = {
      games: [],
      gamesByID: {},
      wins: 0,
      losses: 0,
      pending: 0,
    }
  }

  componentDidMount() {
    const { friendID, uid } = this.props;
    getGamesAgainstOpponent(friendID, uid)
      .then((games) => {
        this.parseGameData(games);
      })
      .catch(() => {
        this.props.setErrorMessage("Unable to retrieve games.");
      });
  }

  parseGameData(gamesData) {
    const games = gamesData.map((game) => {
      return game.objectId;
    });
    const gamesByID = {};
    gamesData.forEach((game) => {
      gamesByID[game.objectId] = game;
    });
    this.setState({
      games,
      gamesByID,
    });
  }

  render() {
    const { gamesByID } = this.state;
    const { friend } = this.props;
    const gamesByIDKeys = Object.keys(gamesByID);

    return (
      <View>
        <Text>{ friend.username }</Text>
        {gamesByIDKeys.map((gameID) =>
          <ListItem
            key={gameID}
            title={gamesByID[gameID].winner}
          />
        )}
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
    uid: state.user.uid,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Friend));
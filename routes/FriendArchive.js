import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';

import { updatePinsAgainstOpponent, getOpponentArchive } from "../data/parse-client/getters";
import { remoteToLocal } from "../data/utilities/functions/dataConversions";
import { setErrorMessage } from '../data/redux/messages';

import GameListItem from '../components/containers/GameListItem';

class FriendArchive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
    }
  }

  componentDidMount() {
    const { friendID, uid } = this.props;
    updatePinsAgainstOpponent(friendID, uid)
      .finally(() => {
        this._getOpponentArchive();
      });
  }

  _getOpponentArchive() {
    const { friendID, uid } = this.props;
    getOpponentArchive(friendID, uid, true)
      .then((games) => {
        const parsedGames = games.map((game) => {
          return remoteToLocal(game, uid);
        });
        this.setState({ games: parsedGames });
      })
      .catch((err) => {
        this.props.setErrorMessage(err);
      });
  }

  render() {
    const { friendID, friend } = this.props;
    const { games } = this.state;

    return (
      <View>
        <Text>FriendArchive.js</Text>
        <Text>{ friendID }</Text>
        <Text>{ friend ? friend.username : '' }</Text>
        <FlatList
          data={games}
          renderItem={({item: game}) =>
            <GameListItem
              key={ game.sourceData.objectId }
              opponentName={ friend.username }
              gameID={ game.sourceData.objectId }
              gameStatus={ game.status }
              turn={ game.turn }
              winner={ game.winner }
              player1={ game.p1 }
              playerScore={ game.currentPlayer.score }
              opponentScore={ game.opponent.score }
              hideOpponentName
            />
          }
        />
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { friendID } = ownProps.match.params;
  const friend = state.user.friendsByID[friendID];
  return {
    uid: state.user.uid,
    friend,
    friendID,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FriendArchive));
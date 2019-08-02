import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';

import { remoteToLocal } from "../data/utilities/functions/dataConversions";
import { getFullGameArchive } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";
import GameListItem from "../components/containers/GameListItem";

class GameArchive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
    }
  }

  componentDidMount() {
    getFullGameArchive(this.props.uid)
      .then((archive) => {
        this.setState({
          games: archive.map((game) => {
            return remoteToLocal(game);
          }),
        });
      })
      .catch(() => {
        this.props.setErrorMessage("unable to get game archive");
      });
  }

  render() {
    const { games } = this.state;
    return (
      <FlatList
        data={games}
        keyExtractor={ (item) => item.sourceData.objectId }
        renderItem={ ({item: game}) =>
          <GameListItem
            key={ game.sourceData.objectId }
            opponentName={ game.opponent.name }
            gameID={ game.sourceData.objectId }
            gameStatus={ game.status }
            turn={ game.turn }
            winner={ game.winner }
            player1={ game.p1 }
            playerScore={ game.currentPlayer.score }
            opponentScore={ game.opponent.score }
          />
        }
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    uid: state.user.uid,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(GameArchive);
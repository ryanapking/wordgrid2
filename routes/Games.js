import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem, Button } from "react-native-elements";

import { startGame } from "../data/parse-client/actions";

class Games extends Component {
  render() {

    const readyToPlay = Object.keys(this.props.gameData.byID).filter( (gameID) => {
      const game = this.props.gameData.byID[gameID];
      return ( game.turn === this.props.userID && !game.winner );
    });

    const waitingOnOpponent = Object.keys(this.props.gameData.byID).filter( (gameID) => {
      const game = this.props.gameData.byID[gameID];
      return ( game.turn === null || (game.turn !== this.props.userID && !game.winner) );
    });

    const over = Object.keys(this.props.gameData.byID).filter( (gameID) => {
      const game = this.props.gameData.byID[gameID];
      return ( game.winner );
    });

    return (
      <View style={{width: '100%'}}>
        <ListItem title="Daily Challenge" onPress={() => this.props.history.push(`/challengeOverview/main`)} />
        {readyToPlay.length > 0 &&
          <View>
            <ListItem title="Ready to Play:" containerStyle={styles.divider} />
            { readyToPlay.map( (gameID, index) => this.getGameListItem(gameID, index, "game"))}
          </View>
        }
        {waitingOnOpponent.length > 0 &&
          <View>
            <ListItem title="Opponent's Move:" containerStyle={styles.divider} />
            { waitingOnOpponent.map( (gameID, index) => this.getGameListItem(gameID, index))}
          </View>
        }
        {over.length > 0 &&
          <View>
            <ListItem title="Ended:" containerStyle={styles.divider} />
            { over.map( (gameID, index) => this.getGameListItem(gameID, index, "review"))}
          </View>
        }
        <Button
          title="New Game"
          loading={ this.props.saving }
          onPress={ () => startGame() }
        />
      </View>
    );
  }

  getGameListItem(gameID, index, linkType = "none") {
    const game = this.props.gameData.byID[gameID];

    let link = null;
    if (linkType === "game") {
      link = () => this.props.history.push(`/game/${gameID}`);
    } else if (linkType === "review") {
      link = () => this.props.history.push(`/gameReview/${gameID}`);
    }

    let winner = null;
    if (game.winner) {
      winner = this.props.userID === game.winner ? "won" : "lost";
    }

    return (
      <ListItem
        title={ game.opponent.name }
        rightTitle={ winner }
        key={index} onPress={link}>
      </ListItem>
    );
  }

}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  divider: {
    backgroundColor: 'lightgray',
  }
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.uid,
    gameData: state.gameData,
    saving: state.login.saving,
  };
};

export default withRouter(connect(mapStateToProps)(Games));
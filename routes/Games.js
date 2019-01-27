import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import {Button, List, ListItem, Spinner} from 'native-base';

import { initiateGame } from "../data/remote";
import { startGame } from "../data/back4app/client/actions";

class Games extends Component {
  render() {

    const readyToPlay = Object.keys(this.props.gameData.byID).filter( (gameID) => {
      const game = this.props.gameData.byID[gameID];
      return ( game.turn === this.props.userID );
    });

    const waitingOnOpponent = Object.keys(this.props.gameData.byID).filter( (gameID) => {
      const game = this.props.gameData.byID[gameID];
      return ( game.turn === null || (game.turn !== "over" && game.turn !== this.props.userID) );
    });

    const over = Object.keys(this.props.gameData.byID).filter( (gameID) => {
      const game = this.props.gameData.byID[gameID];
      return ( game.turn === "over");
    });

    return (
      <View style={{width: '100%'}}>
        <List>
          <ListItem style={styles.listItem} onPress={() => this.props.history.push(`/challengeOverview/main`)}>
            <Text>Daily Challenge</Text>
          </ListItem>
          {readyToPlay.length > 0 &&
            <View>
              <ListItem itemDivider >
                <Text>Ready to Play:</Text>
              </ListItem>
              { readyToPlay.map( (gameID, index) => this.getGameListItem(gameID, index, "game"))}
            </View>
          }
          {waitingOnOpponent.length > 0 &&
            <View>
              <ListItem itemDivider>
                <Text>Opponent's Move:</Text>
              </ListItem>
              { waitingOnOpponent.map( (gameID, index) => this.getGameListItem(gameID, index))}
            </View>
          }
          {over.length > 0 &&
            <View>
              <ListItem itemDivider>
                <Text>Ended:</Text>
              </ListItem>
              { over.map( (gameID, index) => this.getGameListItem(gameID, index, "review"))}
            </View>
          }
        </List>
        { this.getNewGameButton() }
      </View>
    );
  }

  getNewGameButton() {
    if (this.props.saving) {
      return (
        <Button full info disabled>
          <Spinner color='blue'/>
        </Button>
      );
    } else {
      return (
        <Button full info onPress={() => startGame()}>
          <Text>New Game</Text>
        </Button>
      );
    }
  }

  getGameListItem(gameID, index, linkType = "none") {
    const game = this.props.gameData.byID[gameID];

    let link = null;
    if (linkType === "game") {
      link = () => this.props.history.push(`/game/${gameID}`);
    } else if (linkType === "review") {
      link = () => this.props.history.push(`/gameReview/${gameID}`);
    }

    return (
      <ListItem style={styles.listItem} key={index} onPress={link}>
        <Text>{ game.opponentName }</Text>
        { game.winner &&
          <Text style={{textAlign: 'right'}}>{ this.props.gameData.byID[gameID].won ? "won" : "lost" }</Text>
        }
      </ListItem>
    );
  }

}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
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
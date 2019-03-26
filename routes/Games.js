import React, { Component } from 'react';
import { View, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';
import { ListItem } from "react-native-elements";

import { respondToRequest } from "../data/parse-client/actions";
import { setErrorMessage } from "../data/redux/messages";

import StartGameOverlay from '../components/StartGameOverlay';

class Games extends Component {
  constructor() {
    super();

    this.state = {
      responding: [],
    };
  }

  render() {
    const { byID: gamesByID } = this.props.gameData;

    let readyToPlay = [];
    let waitingOnOpponent = [];
    let over = [];
    let requests = [];

    Object.keys(gamesByID).forEach( (gameID) => {
      const game = gamesByID[gameID];

      if ((game.status === "rp-new" || game.status === "rp") && this.props.userID === game.p2) {
        requests.push(gameID);
      } else if (game.turn === this.props.userID && !game.winner) {
        readyToPlay.push(gameID);
      } else if ( game.turn === null || (game.turn !== this.props.userID && !game.winner) ) {
        waitingOnOpponent.push(gameID);
      } else if ( game.winner ) {
        over.push(gameID);
      }
    });

    return (
      <View style={{width: '100%'}}>
        <ListItem title="Daily Challenge" onPress={() => this.props.history.push(`/challengeOverview/main`)} />
        {requests.length > 0 &&
          <View>
            <ListItem title="New Game Requests:" containerStyle={styles.divider} />
            { requests.map( (gameID, index) => this.getRequestListItem(gameID, index))}
          </View>
        }
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
        <StartGameOverlay />
      </View>
    );
  }

  getRequestListItem(gameID, index, linkType) {
    const game = this.props.gameData.byID[gameID];
    const responding = this.state.responding.includes(gameID);

    const requestButtons = (
      <View style={styles.requestButtons}>
        <View style={styles.buttonSpacer}>
          <Button
            title="Accept"
            onPress={ () => this._respondToRequest(gameID, true) }
            color="green"
          />
        </View>
        <View>
          <Button
            title="Reject"
            onPress={ () => this._respondToRequest(gameID, false) }
            color="red"
          />
        </View>
      </View>
    );

    const spinner = <ActivityIndicator />;

    return (
      <ListItem
        title={ game.opponent.name }
        rightTitle={ responding ? spinner : requestButtons }
        key={index}
      />
    )
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
        key={index}
        onPress={link}
      />
    );
  }

  _respondToRequest(gameID, accept) {
    // add to the responding state to disable buttons and prevent duplicate requests
    this.setState({
      responding: [...this.state.responding, gameID],
    });

    respondToRequest(gameID, accept)
      .catch( (err) => {
        this.props.setErrorMessage(err.toString());
      })
      .finally( () => {

        // remove the id from the responding state
        this.setState({
          responding: this.state.responding.filter( (respondingGameID) => {
            return respondingGameID !== gameID;
          })
        });

      });
  }

}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  divider: {
    backgroundColor: 'lightgray',
  },
  requestButtons: {
    display: 'flex',
    flexDirection: 'row',
  },
  buttonSpacer: {
    marginRight: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.uid,
    gameData: state.gameData,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Games));
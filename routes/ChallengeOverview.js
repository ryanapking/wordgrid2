import React, { Component } from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { connect } from 'react-redux';
import { List, ListItem } from "native-base";
import { withRouter } from 'react-router-native';

import { getCurrentChallenge, storeChallengeByDate, getChallengeAttemptDates } from "../data/async-storage";
import { getUpcomingChallengesByDate } from "../data/back4app/client/getters";

class ChallengeOverview extends Component {
  constructor() {
    super();

    this.state = {
      currentChallenge: null,
      pastChallengeDates: [],
    };
  }

  componentDidMount() {
    this._getCurrentChallenge();
    this._getChallengeAttemptDates();
  }

  render() {
    const { displayChallengeID } = this.props;
    const { challengeIDs, attemptsByID, challengesByID } = this.props.attemptsHistory;


    let displayList = null;
    if (displayChallengeID === "main") {
      displayList = this.getChallengesList();
    } else {
      displayList = this.getAttemptsList(displayChallengeID);
    }

    return (
      <List>
        <ListItem style={styles.listItem} onPress={() => this.props.history.push(`/challenge`)}>
          <Text>Play Now: { this.state.currentChallenge ? this.state.currentChallenge.date : "nada" }</Text>
        </ListItem>
        {this.state.pastChallengeDates.map( (date, index) =>
          <ListItem key={index}>
            <Text>{ date }</Text>
          </ListItem>
        )}
        { displayList }
      </List>
    )
  }

  getChallengesList() {
    const { challengeIDs } = this.props.attemptsHistory;

    return (
      <View>
        <ListItem itemDivider >
          <Text>Challenges:</Text>
        </ListItem>
        { challengeIDs.map( (challengeID, index) =>
          <ListItem style={styles.listItem} key={index} onPress={() => this.props.history.push(`/challengeOverview/${challengeID}`)}>
            <Text>{ challengeID }</Text>
          </ListItem>
        )}
      </View>
    );
  }

  getAttemptsList(challengeID) {
    const { attemptsByID } = this.props.attemptsHistory;
    const attempts = attemptsByID[challengeID];

    return (
      <View>
        <ListItem itemDivider >
          <Text>Attempts:</Text>
        </ListItem>
        { attempts.map( (attempt, index) =>
          <ListItem style={styles.listItem} key={index} onPress={() => this.props.history.push(`/challengeReview/${challengeID}/${index}`)}>
            <Text>{ attempt.score } points</Text>
          </ListItem>
        )}
      </View>
    );
  }

  // queries async-storage for the current challenge, queries Parse if not found
  _getCurrentChallenge() {
    getCurrentChallenge(this.props.userID)
      .then( (challenge) => {
        if (challenge) {
          this.setState({
            currentChallenge: challenge,
          });
        } else {
          this._getUpcomingChallenges();
        }
      });
  }

  // queries Parse server for upcoming challenges and saves to local storage
  _getUpcomingChallenges() {
    getUpcomingChallengesByDate()
      .then( async (challenges) => {
        const dates = Object.keys(challenges);
        for (let i = 0; i < dates.length; i++) {
          const date = dates[i];
          await storeChallengeByDate(this.props.userID, challenges[date], date)
            .catch( (err) => {
              console.log('error:', err);
            });
        }
        this._getCurrentChallenge();
      });
  }

  _getChallengeAttemptDates() {
    getChallengeAttemptDates(this.props.userID)
      .then( (dates) => {
        this.setState({
          pastChallengeDates: dates,
        })
      });
  }
}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
  }
});

const mapStateToProps = (state, ownProps) => {
  return {
    displayChallengeID: ownProps.match.params.challengeID,
    attemptsHistory: state.challengeData.attemptsHistory,
    userID: state.user.uid,
  };
};

export default withRouter(connect(mapStateToProps)(ChallengeOverview));
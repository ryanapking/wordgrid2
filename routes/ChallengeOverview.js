import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { List, ListItem } from "native-base";
import { withRouter } from 'react-router-native';

import { getCurrentChallenge, storeChallengeByDate, getChallengeAttemptDates, getChallengeAttemptsByDate } from "../data/async-storage";
import { getUpcomingChallengesByDate } from "../data/back4app/client/getters";
import { setSourceChallengeData } from "../data/redux/challengeData";

class ChallengeOverview extends Component {
  constructor() {
    super();

    this.state = {
      currentChallenge: null,
      currentChallengeAttempts: [],
      pastChallengeDates: [],
    };
  }

  componentDidMount() {
    this._getCurrentChallenge();
    this._getChallengeAttemptDates();
  }

  render() {
    const { currentChallenge, currentChallengeAttempts, pastChallengeDates } = this.state;

    console.log('current challenge:', currentChallenge);
    console.log('current attempts:', currentChallengeAttempts);

    return (
      <List>
        <ListItem style={styles.listItem} onPress={() => this.props.history.push(`/challenge`)}>
          <Text>{ currentChallenge ? "Play Now" : "Searching for Current Challenge" }</Text>
        </ListItem>
        { currentChallengeAttempts.length > 0 ?
          <ListItem itemDivider >
            <Text>Attempts:</Text>
          </ListItem>
          : null
        }
        { currentChallengeAttempts.map( (attempt, index) =>
          <ListItem key={index} style={styles.listItem} onPress={() => this.props.history.push(`/challengeAttemptReview/${currentChallenge.date}/${attempt.attemptIndex}`)}>
            <Text>{ attempt.score } points</Text>
            <Text>{ attempt.savedRemotely.toString() }</Text>
          </ListItem>
        )}
        <ListItem itemDivider >
          <Text>Past Challenges:</Text>
        </ListItem>
        { pastChallengeDates.map( (date, index) =>
          <ListItem key={index} onPress={() => this.props.history.push(`/challengeAttempts/${date}`)}>
            <Text>{ date }</Text>
          </ListItem>
        )}
      </List>
    )
  }

  // queries async-storage for the current challenge, queries Parse if not found
  _getCurrentChallenge() {
    getCurrentChallenge(this.props.userID)
      .then( (challenge) => {
        if (challenge) {
          this.setState({
            currentChallenge: challenge,
          });
          this._getCurrentChallengeAttempts(challenge.date);
          this.props.setSourceChallengeData(challenge);
        } else {
          this._getUpcomingChallengesByDate();
        }
      });
  }

  // queries async-storage for attempts based on the current challenge date
  _getCurrentChallengeAttempts(date) {
    getChallengeAttemptsByDate(this.props.userID, date)
      .then( (attempts) => {

        // mark each attempt's index, then sort based on score
        // index is used when retrieving specific attempts
        const markedAttempts = attempts.map( (attempt, attemptIndex) => {
          return {
            ...attempt,
            attemptIndex
          };
        }).sort( (a, b) => {
          if (a.score > b.score) return -1;
          if (a.score < b.score) return 1;
          return 0;
        });

        this.setState({
          currentChallengeAttempts: markedAttempts
        });
      });
  }

  // queries Parse server for upcoming challenges and saves to local storage
  _getUpcomingChallengesByDate() {
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

  // get array of attempt dates
  _getChallengeAttemptDates() {
    getChallengeAttemptDates(this.props.userID)
      .then( (dates) => {
        this.setState({
          pastChallengeDates: dates,
        });
      });
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
  };
};

const mapDispatchToProps = {
  setSourceChallengeData,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeOverview));
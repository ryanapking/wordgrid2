import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import moment from 'moment';

import {
  getChallengeAttemptDates,
  getChallengeAttemptsByDate,
  markChallengeAttemptSavedRemotely
} from "../data/async-storage";
import { setErrorMessage } from "../data/redux/messages";
import { getRecentChallenges, getCurrentChallenge } from "../data/parse-client/getters";
import { saveChallengeAttempt } from "../data/parse-client/actions";
import { setSourceChallengeData } from "../data/redux/challengeData";

class Challenges extends Component {
  constructor() {
    super();

    this.state = {
      gettingChallenge: true,
      currentChallenge: null,
      recentChallenges: [],
    };
  }

  componentDidMount() {
    this._getCurrentChallenge().then();
    this._getRecentChallenges().then();
  }

  render() {
    const { recentChallenges, currentChallenge } = this.state;

    console.log('current challenge:', currentChallenge);
    console.log('recent challenges:', recentChallenges);

    return (
      <View>
        <ListItem
          onPress={() => this.props.history.push(`/challengeAttempt`)}
          title={ currentChallenge ? "Play Now" : "Searching for Current Challenge" }
        />
        { recentChallenges.map((challenge) =>
          <ListItem
            key={ challenge.objectId }
            title={ moment(challenge.endDate.iso).format('MM-DD-YYYY') }
            onPress={ () => this.props.history.push(`/challenge/${challenge.objectId}`) }
          />
        )}
      </View>
    )
  }

  async _getCurrentChallenge() {
    const currentChallenge = await getCurrentChallenge()
      .catch((err) => {
        this.props.setErrorMessage(err);
        console.log('error getting current challenge', err);
      });

    this.props.setSourceChallengeData(currentChallenge);
    this.setState({
      currentChallenge,
      gettingChallenge: false,
    });
  }

  async _getRecentChallenges() {
    const challengesGenerator = getRecentChallenges(); // returns values form local data store, then from remote, if needed
    let valuesRemain = true;
    while (valuesRemain) {
      const { value: challenges, done } = await challengesGenerator.next();
      valuesRemain = !done;
      if (!challenges) continue;
      this.setState({ recentChallenges: challenges });
      console.log('challenges:', challenges);
      console.log('done:', done);
    }
  }

  // queries async-storage for attempts based on the current challenge date
  _getCurrentChallengeAttempts(date) {
    getChallengeAttemptsByDate(this.props.uid, date)
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
          if (a.savedRemotely) return -1;
          return 0;
        });

        // should try to save the first game remotely, if it isn't already saved
        // doing it here will make it fairly automatic while not repeating too frequently in case there's an error
        if (markedAttempts.length > 0 && !markedAttempts[0].savedRemotely) {
          console.log('trying to save attempt:', markedAttempts[0]);
          this._saveChallengeAttempt(markedAttempts[0], date, markedAttempts[0].attemptIndex);
        }

        this.setState({
          currentChallengeAttempts: markedAttempts
        });
      });
  }

  // saves an attempt remotely
  _saveChallengeAttempt(attempt, currentChallengeDate, attemptIndex) {
    saveChallengeAttempt(attempt)
      .then( () => {
        markChallengeAttemptSavedRemotely(this.props.uid, currentChallengeDate, attemptIndex)
          .then( () => {
            this._getCurrentChallengeAttempts(currentChallengeDate);
          });
      });
  }

  // get array of attempt dates from local storage
  _getChallengeAttemptDates() {
    getChallengeAttemptDates(this.props.uid)
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
  },
  divider: {
    backgroundColor: 'lightgray',
  }
});

const mapStateToProps = (state) => {
  return {
    uid: state.user.uid,
  };
};

const mapDispatchToProps = {
  setSourceChallengeData,
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Challenges));
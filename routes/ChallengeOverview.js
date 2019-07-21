import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';

import { getCurrentChallenge, storeChallengesByDate, getChallengeAttemptDates, getChallengeAttemptsByDate, markChallengeAttemptSavedRemotely } from "../data/async-storage";
import { getUpcomingChallengesByDate } from "../data/parse-client/getters";
import { saveChallengeAttempt } from "../data/parse-client/actions";
import { setSourceChallengeData } from "../data/redux/challengeData";

class ChallengeOverview extends Component {
  constructor() {
    super();

    this.state = {
      gettingChallenge: true,
      currentChallenge: null,
      currentChallengeAttempts: [],
      pastChallengeDates: [],
    };
  }

  componentDidMount() {
    this._getCurrentChallenge()
      .then((currentChallenge) => {
        this.setState({
          currentChallenge,
          gettingChallenge: false,
        });
        this._getCurrentChallengeAttempts(currentChallenge.date);
        this.props.setSourceChallengeData(currentChallenge);
      })
      .catch(() => {
        this.setState({ gettingChallenge: false })
      });
    // this._getChallengeAttemptDates();
  }

  render() {
    const { currentChallenge, currentChallengeAttempts, pastChallengeDates } = this.state;

    // console.log('current challenge:', currentChallenge);
    // console.log('current attempts:', currentChallengeAttempts);

    return (
      <View>
        <ListItem onPress={() => this.props.history.push(`/challenge`)}
          title={ currentChallenge ? "Play Now" : "Searching for Current Challenge" }
        />
        { currentChallengeAttempts.length > 0 ?
          <ListItem title="Attempts" containerStyle={styles.divider} />
          : null
        }
        { currentChallengeAttempts.map( (attempt, index) =>
          <ListItem
            key={index} style={styles.listItem}
            title={ attempt.score + " points" }
            rightTitle={ attempt.savedRemotely.toString() }
            onPress={() => this.props.history.push(`/challengeAttemptReview/${currentChallenge.date}/${attempt.attemptIndex}`)}
          />
        )}
        <ListItem title="Past Challenges" containerStyle={styles.divider} />
        { pastChallengeDates.map( (date, index) =>
          <ListItem
            title={ date }
            key={index}
            onPress={() => this.props.history.push(`/challengeAttempts/${date}`)}
          />
        )}
      </View>
    )
  }

  async _getCurrentChallenge() {

    // try to get the current challenge from async storage
    let currentChallenge = await getCurrentChallenge(this.props.userID)
      .catch((err) => {
        throw new Error('error getting current challenge from async storage');
      });

    // if we don't have the current challenge here, it probably hasn't been downloaded from parse yet.
    if (!currentChallenge) {

      // download upcoming challenges from parse
      const upcomingChallenges = await getUpcomingChallengesByDate()
        .catch((err) => {
          throw new Error('error getting upcoming challenges from parse');
        });

      // save upcoming challenges to async storage
      await storeChallengesByDate(this.props.uid, upcomingChallenges)
        .catch((err) => {
          throw new Error('error storing upcoming challenges in async storage');
        });

      // try again to get the current challenge from async storage
      currentChallenge = await getCurrentChallenge(this.props.userID)
        .catch((err) => {
          throw new Error('error getting current challenge from async storage');
        });
    }

    // if we have the challenge, set the appropriate state values
    if (currentChallenge) {
      return currentChallenge;
    } else {
      throw new Error('current challenge not found');
    }

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
        markChallengeAttemptSavedRemotely(this.props.userID, currentChallengeDate, attemptIndex)
          .then( () => {
            this._getCurrentChallengeAttempts(currentChallengeDate);
          });
      });
  }

  // get array of attempt dates from local storage
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
  },
  divider: {
    backgroundColor: 'lightgray',
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
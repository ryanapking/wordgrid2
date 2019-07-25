import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import moment from 'moment';

import { setErrorMessage } from "../data/redux/messages";
import { getRecentChallenges, getCurrentChallenge } from "../data/parse-client/getters";

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
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Challenges));
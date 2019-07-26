import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Button } from 'react-native';
import { connect } from 'react-redux';
import { ListItem, Text } from 'react-native-elements';
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
    const { recentChallenges } = this.state;

    return (
      <ScrollView>
        { this.currentChallengeSection() }
        <Text h4 style={styles.h4}>Recent Challenges</Text>
        { recentChallenges.map((challenge, index) =>
          <ListItem
            key={ challenge.objectId }
            title={ moment(challenge.endDate.iso).format('MM-DD-YYYY') }
            subtitle="tap to review"
            rightTitle={ challenge.playerCount + " participants"}
            onPress={ () => this.props.history.push(`/challenge/${challenge.objectId}`) }
            bottomDivider
          />
        )}
      </ScrollView>
    )
  }

  currentChallengeSection() {
    const { currentChallenge } = this.state;
    if (!currentChallenge) return null;
    const playerCountMessage = currentChallenge.playerCount > 0 ? currentChallenge.playerCount + " participants" : "";
    return (
      <View>
        <Text h4 style={styles.h4}>Current Challenge</Text>
        { playerCountMessage ? <Text>{ playerCountMessage }</Text> : null }
        <View style={styles.row}>
          <View style={styles.halfColumn} >
            <Button
              title="Play Now"
              onPress={ () => this.props.history.push(`/challengeAttempt`) }
            />
          </View>
          <View style={styles.halfColumn} >
            <Button
              title="Review Attempts"
              onPress={ () => this.props.history.push(`/challenge/${currentChallenge ? currentChallenge.objectId : ''}`) }
            />
          </View>
        </View>
      </View>
    );
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
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 20,
  },
  halfColumn: {
    width: '50%',
  },
  h4: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'lightgray',
  },
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
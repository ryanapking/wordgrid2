import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import moment from 'moment';

import { getChallengeByID, getAttemptByChallengeID } from "../data/parse-client/getters";
import { getAttemptsByChallengeID } from "../data/async-storage/challengeAttempts";
import { setErrorMessage } from "../data/redux/messages";

class Challenge extends Component {
  constructor() {
    super();

    this.state = {
      challenge: null,
      officialAttempt: null,
      localAttempts: [],
    };
  }

  componentDidMount() {
    this._getChallengeByID().then();
    this._getOfficialAttemptByChallengeID().then();
    this._getLocalAttemptsByChallengeID().then();
  }

  render() {
    return (
      <View>
        { this.challengeInfoSection() }
        { this.officialAttemptSection() }
        { this.winnersSection() }
        { this.localAttemptsSection() }
      </View>
    )
  }

  challengeInfoSection() {
    const { challenge } = this.state;
    if (!challenge) return null;
    return (
      <View>
        <ListItem title={ "Challenge from " + moment(challenge.endDate.iso).format('MM-DD-YYYY') } />
        <ListItem title={ challenge.playerCount + " participants" } />
      </View>
    )
  }

  officialAttemptSection() {
    const { challenge, officialAttempt } = this.state;
    if (!challenge || !officialAttempt) return null;
    return (
      <View>
        <ListItem title="Your best attempt" containerStyle={styles.divider} />
        <ListItem title={ "you ranked " + officialAttempt.rank + " of " + challenge.playerCount + " players" } />
        <ListItem title={officialAttempt.score + " points"} />
      </View>
    )
  }

  winnersSection() {
    const { challenge } = this.state;
    if (!challenge) return null;
    const { winners } = challenge;
    if (!winners) return null;
    return (
      <View>
        <ListItem title={"Winners"} containerStyle={styles.divider} />
        { winners.map((attempt, index) =>
          <ListItem
            key={index}
            title={ attempt.score + " points" }
            onPress={() => this.props.history.push(`/challengeAttemptReview/${attempt.objectId}`)}
          />
        )}
      </View>
    )
  }

  localAttemptsSection() {
    const { localAttempts } = this.state;
    return (
      <View>
        <ListItem title="Your Additional Attempts" containerStyle={styles.divider} />
        { localAttempts.map( (attempt, index) =>
          <ListItem
            key={index}
            title={ attempt.score + " points" }
            onPress={() => this.props.history.push(`/challengeAttemptReview/${attempt.objectId}`)}
          />
        )}
      </View>
    )
  }

  // pulls attempt from Parse local store or remote, if needed
  async _getOfficialAttemptByChallengeID() {
    const { challengeID, userID } = this.props;
    this._getChallengeByID().then();
    const attempt = await getAttemptByChallengeID(challengeID, userID)
      .catch((err) => {
        console.log('No attempt found');
      });

    this.setState({ officialAttempt: attempt });
  }

  async _getChallengeByID() {
    const { challengeID } = this.props;
    const challenge = await getChallengeByID(challengeID)
      .catch((err) => {
        this.props.setErrorMessage("Unable to find challenge");
      });
    this.setState({ challenge });
  }

  async _getLocalAttemptsByChallengeID() {
    const { challengeID, userID } = this.props;
    const localAttempts = await getAttemptsByChallengeID(userID, challengeID)
      .catch((err) => {
        this.props.setErrorMessage("Error getting attempts from local storage");
      });

    this.setState( { localAttempts });
  }
}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  divider: {
    backgroundColor: "lightgray",
  }
});

const mapStateToProps = (state, ownProps) => {
  const { challengeID } = ownProps.match.params;
  return {
    challengeID,
    userID: state.user.uid,
  };
};

const mapDispatchToProps = {
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Challenge));
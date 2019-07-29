import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { ListItem, Text } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import moment from 'moment';

import { numWithSuffix } from "../data/utilities/functions/calculations";
import { getChallengeByID, getAttemptByChallengeID } from "../data/parse-client/getters";
import { getAttemptsByChallengeID } from "../data/async-storage/challengeAttempts";
import { setErrorMessage } from "../data/redux/messages";

class Challenge extends Component {
  constructor(props) {
    super(props);

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
        <Text h4 style={styles.h4}>Challenge from { moment(challenge.endDate.iso).format('MM-DD-YYYY') }</Text>
        <Text style={styles.p}>{ challenge.playerCount } participants</Text>
      </View>
    )
  }

  officialAttemptSection() {
    const { challenge, officialAttempt } = this.state;
    if (!challenge || !officialAttempt) return null;
    return (
      <View>
        <Text h4 style={styles.h4}>Your best attempt</Text>
        <ListItem
          title={ officialAttempt.score + " points" }
          rightTitle={ numWithSuffix(officialAttempt.rank) }
          rightSubtitle={ "of " + challenge.playerCount + " players" }
          onPress={() => this.props.history.push(`/challengeAttemptReview/${officialAttempt.objectId}`)}
        />
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
        <Text h4 style={styles.h4}>Winners</Text>
        { winners.map((attempt, index) =>
          <ListItem
            key={index}
            title={ attempt.user.username }
            rightTitle={ numWithSuffix(attempt.rank) }
            rightSubtitle={ attempt.score + " points" }
            onPress={() => this.props.history.push(`/challengeAttemptReview/${attempt.objectId}`)}
            bottomDivider={ index + 1 < winners.length }
          />
        )}
      </View>
    )
  }

  localAttemptsSection() {
    const { localAttempts, challenge } = this.state;
    if (!localAttempts.length || !challenge) return null;
    return (
      <View>
        <Text h4 style={styles.h4}>Your Additional Attempts</Text>
        { localAttempts.map( (attempt, index) =>
          <ListItem
            key={index}
            title={ attempt.score + " points" }
            rightTitle="tap to review"
            onPress={() => this.props.history.push(`/challengeAttemptReview/${challenge.objectId}/${index}`)}
            bottomDivider={ index + 1 < localAttempts.length }
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
        console.log('No attempt found', err);
      });

    this.setState({ officialAttempt: attempt });
  }

  async _getChallengeByID() {
    const { challengeID } = this.props;
    const challenge = await getChallengeByID(challengeID)
      .catch(() => {
        this.props.setErrorMessage("Unable to find challenge");
      });
    this.setState({ challenge });
  }

  async _getLocalAttemptsByChallengeID() {
    const { challengeID, userID } = this.props;
    const localAttempts = await getAttemptsByChallengeID(userID, challengeID)
      .catch(() => {
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
  },
  h4: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'lightgray',
  },
  p: {
    padding: 10,
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
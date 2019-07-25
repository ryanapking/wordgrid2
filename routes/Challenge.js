import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';

import { getChallengeByID, getAttemptByChallengeID } from "../data/parse-client/getters";
import { setErrorMessage } from "../data/redux/messages";

class Challenge extends Component {
  constructor() {
    super();

    this.state = {
      challenge: {},
      officialAttempt: {},
      localAttempts: [],
      attempts: [],
    };
  }

  componentDidMount() {
    this._getChallengeByID().then();
    this._getOfficialAttemptByChallengeID().then();
    this._getLocalAttemptsByChallengeID().then();
  }

  render() {
    const { attempts, challenge, officialAttempt, localAttempts } = this.state;
    const { winners } = challenge;

    console.log('Challenge.js render()', { challenge, winners, officialAttempt, localAttempts });

    return (
      <View>
        <ListItem title={ "Challenge from " + this.props.challengeDate } />
        <ListItem title="Attempts" containerStyle={styles.divider} />
        { attempts.map( (attempt, index) =>
          <ListItem
            key={index}
            title={ attempt.score + " points" }
            onPress={() => this.props.history.push(`/challengeAttemptReview/${this.props.challengeDate}/${index}`)}
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
    console.log('_getLocalAttemptsByChallengeID()');
    const { challengeID, userID } = this.props;
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
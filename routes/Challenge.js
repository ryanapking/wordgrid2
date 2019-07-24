import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';

import { getChallengeByID } from "../data/parse-client/getters";
import { getChallengeAttemptsByDate } from "../data/async-storage";
import { setErrorMessage } from "../data/redux/messages";

class Challenge extends Component {
  constructor() {
    super();

    this.state = {
      challenge: {},
      attempts: [],
    };
  }

  componentDidMount() {
    this._getChallengeByID().then();
    // this._getAttempts();
  }

  render() {
    const { attempts, challenge } = this.state;
    const { winners } = challenge;

    console.log('Challenge.js render()', {challenge, winners});

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

  async _getChallengeByID() {
    const { challengeID } = this.props;
    const challenge = await getChallengeByID(challengeID)
      .catch((err) => {
        this.props.setErrorMessage("Unable to find challenge");
      });
    this.setState({ challenge });
  }

  // get array of attempts
  _getAttempts() {
    getChallengeAttemptsByDate(this.props.userID, this.props.challengeDate)
      .then( (attempts) => {
        this.setState({
          attempts: attempts,
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
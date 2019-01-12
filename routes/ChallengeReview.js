import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

class ChallengeReview extends Component {
  render() {
    const { attempt } = this.props;

    return (
      <View>
        <Text>ChallengeReview.js</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const mapStateToProps = (state, ownProps) => {
  const { challengeID, attemptIndex } = ownProps.match.params;
  const attempt = state.challengeData.attemptsHistory.attemptsByID[challengeID][attemptIndex];
  return {
    attempt
  };
};

export default withRouter(connect(mapStateToProps)(ChallengeReview));
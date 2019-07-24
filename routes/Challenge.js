import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';

import { getChallengeAttemptsByDate } from "../data/async-storage";

class Challenge extends Component {
  constructor() {
    super();

    this.state = {
      challenge: null,
      attempts: [],
    };
  }

  componentDidMount() {
    // this._getAttempts();
  }

  render() {
    const { attempts } = this.state;

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
  console.log('challenge ID:', challengeID);
  return {
    challengeID,
    userID: state.user.uid,
  };
};

export default withRouter(connect(mapStateToProps)(Challenge));
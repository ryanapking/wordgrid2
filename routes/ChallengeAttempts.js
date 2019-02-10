import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { List, ListItem } from "native-base";
import { withRouter } from 'react-router-native';

import { getChallengeAttemptsByDate } from "../data/async-storage";

class ChallengeAttempts extends Component {
  constructor() {
    super();

    this.state = {
      challenge: null,
      attempts: [],
    };
  }

  componentDidMount() {
    this._getAttempts();
  }

  render() {
    const { attempts } = this.state;

    return (
      <List>
        <ListItem style={styles.listItem}>
          <Text>Challenge from { this.props.challengeDate }</Text>
        </ListItem>
        <ListItem itemDivider >
          <Text>Attempts:</Text>
        </ListItem>
        { attempts.map( (attempt, index) =>
          <ListItem key={index} onPress={() => this.props.history.push(`/challengeAttemptReview/${this.props.challengeDate}/${index}`)}>
            <Text>{ attempt.score } points</Text>
          </ListItem>
        )}
      </List>
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
  }
});

const mapStateToProps = (state, ownProps) => {
  const { challengeDate } = ownProps.match.params;
  return {
    challengeDate: challengeDate,
    userID: state.user.uid,
  };
};

export default withRouter(connect(mapStateToProps)(ChallengeAttempts));
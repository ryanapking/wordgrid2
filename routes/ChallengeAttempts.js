import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { List, ListItem } from "native-base";
import { withRouter } from 'react-router-native';

import { getChallengeByDate, getChallengeAttemptsByDate } from "../data/async-storage";

class ChallengeAttempts extends Component {
  constructor() {
    super();

    this.state = {
      challenge: null,
      attempts: [],
    };
  }

  componentDidMount() {
    this._getChallenge();
    this._getAttempts();
  }

  render() {
    const { challenge, attempts } = this.state;

    console.log('state:', {
      challenge, attempts
    });

    // return <Text>ChallengeAttempts.js: {this.props.challengeDate} something</Text>;

    return (
      <List>
        <ListItem style={styles.listItem} onPress={() => this.props.history.push(`/challenge`)}>
          <Text>{ challenge ? challenge.date : null}</Text>
        </ListItem>
        <ListItem itemDivider >
          <Text>Attempts:</Text>
        </ListItem>
        { attempts.map( (attempt, index) =>
          <ListItem key={index}>
            <Text>attempt identifier here</Text>
          </ListItem>
        )}
      </List>
    )
  }

  // queries async-storage for the current challenge, queries Parse if not found
  _getChallenge() {
    getChallengeByDate(this.props.userID, this.props.date)
      .then( (challenge) => {
        this.setState({
          challenge: challenge,
        });
      });
  }

  // get array of attempt dates
  _getAttempts() {
    getChallengeAttemptsByDate(this.props.userID, this.props.date)
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
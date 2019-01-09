import React, { Component } from 'react';
import {StyleSheet, Text} from 'react-native';
import { connect } from 'react-redux';
import { List, ListItem } from "native-base";

import { clearUserData } from "../data/async-storage";

class ChallengeOverview extends Component {
  render() {
    // clearUserData(this.props.userID);
    console.log('render()');
    console.log('attempts history:', this.props.attemptsHistory);
    return (
      <List>
        <ListItem style={styles.listItem} onPress={() => this.props.history.push(`/challenge`)}>
          <Text>Play Now</Text>
        </ListItem>
      </List>
    )
  }
}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
  }
});

const mapStateToProps = (state) => {
  return {
    attemptsHistory: state.challengeData.attemptsHistory,
    userID: state.user.uid,
  };
};

export default connect(mapStateToProps)(ChallengeOverview);
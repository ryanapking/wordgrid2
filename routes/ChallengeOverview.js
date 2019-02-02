import React, { Component } from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { connect } from 'react-redux';
import { List, ListItem } from "native-base";
import { withRouter } from 'react-router-native';

class ChallengeOverview extends Component {
  render() {
    const { displayChallengeID } = this.props;
    const { challengeIDs, attemptsByID, challengesByID } = this.props.attemptsHistory;


    let displayList = null;
    if (displayChallengeID === "main") {
      displayList = this.getChallengesList();
    } else {
      displayList = this.getAttemptsList(displayChallengeID);
    }

    console.log('render()');
    console.log('attempts history:', this.props.attemptsHistory);
    console.log('display ID:', displayChallengeID);
    return (
      <List>
        <ListItem style={styles.listItem} onPress={() => this.props.history.push(`/challenge`)}>
          <Text>Play Now</Text>
        </ListItem>
        { displayList }
      </List>
    )
  }

  getChallengesList() {
    const { challengeIDs } = this.props.attemptsHistory;

    return (
      <View>
        <ListItem itemDivider >
          <Text>Challenges:</Text>
        </ListItem>
        { challengeIDs.map( (challengeID, index) =>
          <ListItem style={styles.listItem} key={index} onPress={() => this.props.history.push(`/challengeOverview/${challengeID}`)}>
            <Text>{ challengeID }</Text>
          </ListItem>
        )}
      </View>
    );
  }

  getAttemptsList(challengeID) {
    const { attemptsByID } = this.props.attemptsHistory;
    const attempts = attemptsByID[challengeID];

    return (
      <View>
        <ListItem itemDivider >
          <Text>Attempts:</Text>
        </ListItem>
        { attempts.map( (attempt, index) =>
          <ListItem style={styles.listItem} key={index} onPress={() => this.props.history.push(`/challengeReview/${challengeID}/${index}`)}>
            <Text>{ attempt.score } points</Text>
          </ListItem>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
  }
});

const mapStateToProps = (state, ownProps) => {
  return {
    displayChallengeID: ownProps.match.params.challengeID,
    attemptsHistory: state.challengeData.attemptsHistory,
    userID: state.user.uid,
  };
};

export default withRouter(connect(mapStateToProps)(ChallengeOverview));
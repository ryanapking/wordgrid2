import React from 'react';
import { StyleSheet, ScrollView, View, Button } from 'react-native';
import { ListItem, Text } from 'react-native-elements';
import moment from 'moment';

import { useHistory } from "../hooks/tempReactRouter";
import { useParseFetcher } from "../hooks/useParseFetcher";
import { getRecentChallenges, getCurrentChallenge } from "../data/parse-client/getters";

const Challenges = () => {
  const history = useHistory();
  const [currentChallenge] = useParseFetcher(getCurrentChallenge, {});
  const [recentChallenges] = useParseFetcher(getRecentChallenges, {}, true);

  return (
    <ScrollView>
      {!currentChallenge ? null :
        <View>
          <Text h4 style={styles.h4}>Current Challenge</Text>
          { currentChallenge.playerCount > 0 ? <Text>{ currentChallenge.playerCount } participants</Text> : null }
          <View style={styles.row}>
            <View style={styles.halfColumn} >
              <Button
                title="Play Now"
                onPress={ () => history.push(`/challengeAttempt`) }
              />
            </View>
            <View style={styles.halfColumn} >
              <Button
                title="Review Attempts"
                onPress={ () => history.push(`/challenge/${currentChallenge.objectId}`) }
              />
            </View>
          </View>
        </View>
      }
      <Text h4 style={styles.h4}>Recent Challenges</Text>
      { recentChallenges && recentChallenges.map((challenge) =>
        <ListItem
          key={ challenge.objectId }
          title={ moment(challenge.endDate.iso).format('MM-DD-YYYY') }
          subtitle="tap to review"
          rightTitle={ challenge.playerCount + " participants"}
          onPress={ () => history.push(`/challenge/${challenge.objectId}`) }
          bottomDivider
        />
      )}
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  listItem: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  divider: {
    backgroundColor: 'lightgray',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 20,
  },
  halfColumn: {
    width: '50%',
  },
  h4: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'lightgray',
  },
});

export default Challenges;
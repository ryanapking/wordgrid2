import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';
import { ListItem, Text } from 'react-native-elements';
import moment from 'moment';

import { useParams, useHistory } from "../hooks/tempReactRouter";
import { useAsyncFetcher } from "../hooks/useAsyncFetcher";
import { numWithSuffix } from "../data/utilities/functions/calculations";
import { getChallengeByID, getAttemptByChallengeID } from "../data/parse-client/getters";
import { getAttemptsByChallengeID } from "../data/async-storage/challengeAttempts";

const Challenge = () => {
  const params = useParams();
  const history = useHistory();
  const { challengeID } = params;
  const uid = useSelector(state => state.user.uid, shallowEqual);
  const [challenge] = useAsyncFetcher(getChallengeByID, {challengeID});
  const [officialAttempt] = useAsyncFetcher(getAttemptByChallengeID,{challengeID, uid});
  const [localAttempts] = useAsyncFetcher(getAttemptsByChallengeID, {uid, challengeID});

  return (
    <View>
      { challenge &&
        <View>
          <Text h4 style={styles.h4}>Challenge from { moment(challenge.endDate.iso).format('MM-DD-YYYY') }</Text>
          <Text style={styles.p}>{ challenge.playerCount } participants</Text>
        </View>
      }
      { challenge && officialAttempt &&
        <View>
          <Text h4 style={styles.h4}>Your best attempt</Text>
          <ListItem
            title={ officialAttempt.score + " points" }
            rightTitle={ numWithSuffix(officialAttempt.rank) }
            rightSubtitle={ "of " + challenge.playerCount + " players" }
            onPress={() => history.push(`/challengeAttemptReview/${challenge.objectId}/${officialAttempt.objectId}`)}
          />
        </View>
      }
      { challenge && challenge.winners &&
        <View>
          <Text h4 style={styles.h4}>Winners</Text>
          { challenge.winners.map((attempt, index) =>
            <ListItem
              key={index}
              title={ attempt.user.username }
              rightTitle={ numWithSuffix(attempt.rank) }
              rightSubtitle={ attempt.score + " points" }
              onPress={() => history.push(`/challengeAttemptReview/${challenge.objectId}/${attempt.objectId}`)}
              bottomDivider={ index + 1 < challenge.winners.length }
            />
          )}
        </View>
      }
      { localAttempts && localAttempts.length > 0 && challenge &&
        <View>
          <Text h4 style={styles.h4}>Your Additional Attempts</Text>
          { localAttempts.map( (attempt, index) =>
            <ListItem
              key={index}
              title={ attempt.score + " points" }
              rightTitle={"tap to review"}
              onPress={() => history.push(`/challengeAttemptReview/local/${challenge.objectId}/${index}`)}
              bottomDivider={ index + 1 < localAttempts.length }
            />
          )}
        </View>
      }
    </View>
  )
};

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

export default Challenge;
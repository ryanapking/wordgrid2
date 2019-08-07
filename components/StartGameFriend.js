import React from 'react';
import { View, ActivityIndicator } from "react-native";
import { useSelector, shallowEqual } from "react-redux";
import { ListItem } from "react-native-elements";

import { useParseAction } from "../hooks/useParseAction";
import { startGame as parseStartGame } from "../data/parse-client/actions";

const StartGameFriend = () => {
  const friendsByID = useSelector(state => state.user.friendsByID, shallowEqual);
  const [startGame, startGamePending] = useParseAction(parseStartGame);
  const friendsByIDKeys = Object.keys(friendsByID);

  if (startGamePending) return <ActivityIndicator />;
  else return (
    <View>
      <ListItem title="Your Friends" />
      { friendsByIDKeys.map( (friendID) =>
        <ListItem
          key={ friendID }
          title={ friendsByID[friendID].username }
          onPress={ () => startGame({opponentID: friendID}) }
        />
      )}
    </View>
  )
};

export default StartGameFriend;
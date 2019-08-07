import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Input, ListItem } from 'react-native-elements';
import { useSelector, shallowEqual } from "react-redux";

import { useParseAction } from "../hooks/useParseAction";
import { startGame as parseStartGame } from "../data/parse-client/actions";
import { getUsersByPartialString } from "../data/parse-client/getters";

const StartGameSearch = () => {
  const userID = useSelector(state => state.user.uid, shallowEqual);
  const [search, searchPending, searchResults, clearResults] = useParseAction(getUsersByPartialString);
  const [startGame, startGamePending] = useParseAction(parseStartGame);

  return (
    <View>
      <Input
        label="Username"
        autoCapitalize="none"
        onChangeText={ (searchString) => searchString.length >= 3 ? search({searchString, currentUserID: userID}) : clearResults() }
      />
      { searchPending || startGamePending ?
        <ActivityIndicator />
        : null
      }
      { Array.isArray(searchResults) && (!searchPending || !startGamePending) ? searchResults.map( (user) =>
        <ListItem
          title={ user.username }
          key={user.objectId}
          onPress={ () => startGame({opponentID: user.objectId}) }
        />
      ) : null}
    </View>
  )
};

export default StartGameSearch;
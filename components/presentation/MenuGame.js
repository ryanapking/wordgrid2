import React from 'react';
import { StyleSheet, View } from "react-native";
import { ListItem } from "react-native-elements";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import PropTypes from 'prop-types';

import { useParams } from "../hooks/tempReactRouter";
import { resetLocalGameDataByID } from "../../data/redux/gameData";
import { useParseAction } from "../hooks/useParseAction";
// TODO: addFriend and removeFriend should be redux actions so we can trigger the appropriate data refreshes
import {
  forfeitGame as parseForfeitGame,
  addFriend as parseAddFriend,
  removeFriend as parseRemoveFriend,
} from "../../data/parse-client/actions";

const MenuGame = props => {
  const dispatch = useDispatch();
  const params = useParams();
  const { gameID } = params;

  if (!gameID) return null;

  const [uid, game, friends] = useSelector(state => [state.user.uid, state.gameData.byID[gameID], state.user.friends], shallowEqual);
  const [forfeitGame, forfeitPending] = useParseAction(parseForfeitGame);
  const [addFriend, addFriendPending] = useParseAction(parseAddFriend);
  const [removeFriend, removeFriendPending] = useParseAction(parseRemoveFriend);

  if (forfeitPending || addFriendPending || removeFriendPending) {
    props.closeMenu();
  }

  const showFriendOptions = game && friends;
  const isFriend = showFriendOptions ? friends.includes(game.opponent.id) : false;

  return (
    <View>
      <ListItem title="Game Actions" containerStyle={styles.divider} />
      <ListItem title="Reset Move" onPress={ () => dispatch(resetLocalGameDataByID(gameID, uid)) } />
      <ListItem title="Forfeit Game" onPress={ () => forfeitGame({gameID}) } />
      { !showFriendOptions ? null :
        <ListItem
          title={ isFriend ? "Remove Friend" : "Add Friend"}
          titleStyle={game.opponent.id ? {} : styles.disabledTitle}
          onPress={ () => isFriend ? removeFriend({friendID: game.opponent.id}) : addFriend({friendID: game.opponent.id}) }
          disabled={!game.opponent.id}
        />
      }
    </View>
  );
};

MenuGame.propTypes = {
  closeMenu: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  navItem: {

  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  disabledTitle: {
    color: 'lightgray',
  },
  divider: {
    backgroundColor: 'lightgray',
  },
});

export default MenuGame;
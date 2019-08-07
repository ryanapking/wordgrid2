import React from 'react';
import { StyleSheet, View } from "react-native";
import { ListItem } from "react-native-elements";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import PropTypes from 'prop-types';

import { useParams } from "../hooks/tempReactRouter";
import { resetLocalGameDataByID } from "../data/redux/gameData";
import { useParseAction } from "../hooks/useParseAction";
import { forfeitGame as parseForfeitGame } from "../data/parse-client/actions";
import { addFriend, removeFriend } from "../data/redux/thunkedUserActions";

const MenuGame = props => {
  const dispatch = useDispatch();
  const params = useParams();
  const { gameID } = params;

  if (!gameID) return null;

  const [uid, game, friends] = useSelector(state => [state.user.uid, state.gameData.byID[gameID], state.user.friends], shallowEqual);
  const [forfeitGame] = useParseAction(parseForfeitGame);

  const showFriendOptions = game && friends;
  const isFriend = showFriendOptions ? friends.includes(game.opponent.id) : false;

  let friendAction = (friendID) => dispatch(addFriend(friendID));
  if (isFriend) friendAction = (friendID) => dispatch(removeFriend(friendID));

  return (
    <View>
      <ListItem title="Game Actions" containerStyle={styles.divider} />
      <ListItem title="Reset Move" onPress={ () => dispatch(resetLocalGameDataByID(gameID, uid)) } />
      <ListItem title="Forfeit Game" onPress={ () => forfeitGame({gameID}) } />
      { !showFriendOptions ? null :
        <ListItem
          title={ isFriend ? "Remove Friend " + game.opponent.id : "Add Friend " + game.opponent.id}
          titleStyle={game.opponent.id ? {} : styles.disabledTitle}
          onPress={ () => friendAction(game.opponent.id) }
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
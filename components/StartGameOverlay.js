import React, { useState } from 'react';
import { View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Overlay } from 'react-native-elements';

import { startGame as parseStartGame } from "../data/parse-client/actions";
import StartGameFriend from "./StartGameFriend";
import StartGameSearch from "./StartGameSearch";
import { useParseAction } from "../hooks/useParseAction";

const StartGameOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [displayType, setDisplayType] = useState('');
  const [startGame, startGamePending] = useParseAction(parseStartGame);

  const closeOverlay = () => {
    setShowOverlay(false);
    setDisplayType('');
  };

  let overlayContents = null;
  if (startGamePending) {
    overlayContents = <ActivityIndicator />;
  } else if (!displayType) {
    overlayContents = (
      <View style={styles.buttonSection}>
        <Button title="Random Opponent" onPress={ () => startGame({}) } />
        <View style={styles.buttonSpacer}>
          <Button title="Play a Friend" onPress={ () => setDisplayType("friends") } />
        </View>
        <Button title="Find by Username" onPress={ () => setDisplayType("search") } />
      </View>
    )
  } else if (displayType === 'friends') {
    overlayContents = <StartGameFriend />;
  } else if (displayType === 'search') {
    overlayContents = <StartGameSearch />;
  }

  return (
    <View>
      <Button title="Start a new Game" onPress={ () => setShowOverlay(true) } />
      <Overlay
        isVisible={ showOverlay }
        onBackdropPress={ () => closeOverlay() }
      >
        <View>
          {overlayContents}
          <Button title="Cancel" onPress={ () => closeOverlay() } />
        </View>
      </Overlay>
    </View>
  )

};

const styles = StyleSheet.create({
  buttonSection: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  buttonSpacer: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default StartGameOverlay;
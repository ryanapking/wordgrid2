import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Overlay } from 'react-native-elements';

import { clearErrorMessage, clearInfoMessage } from "../../data/redux/messages";

const MessageOverlay = () => {
  const [error, info] = useSelector(state => [state.messages.error, state.messages.info], shallowEqual);
  const dispatch = useDispatch();

  let message, errorNotice;
  let clearMessage = () => {};

  if (error.length) {
    let index = error.length - 1;
    message = error[index];
    clearMessage = () => dispatch(clearErrorMessage(index));
    errorNotice = <Text>Error:</Text>
  } else if (info.length) {
    let index = info.length - 1;
    message = info[index];
    clearMessage = () => dispatch(clearInfoMessage(index));
  }

  // I assume we are mostly sending strings, but just in case, we should convert Error objects to strings
  if (message instanceof Error) {
    message = message.toString();
  }

  return (
    <Overlay
      isVisible={!!message}
      onBackdropPress={ () => clearMessage() }
    >
      <View style={styles.messageArea}>
        { errorNotice }
        <Text>{message}</Text>
        <Button title="Okay" onPress={ () => clearMessage() } />
      </View>
    </Overlay>
  )
};

const styles = StyleSheet.create({
  messageArea: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-around',
  }
});

export default MessageOverlay;
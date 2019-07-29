import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Overlay } from 'react-native-elements';

import { clearErrorMessage, clearInfoMessage } from "../data/redux/messages";

class MessageOverlay extends Component {
  render() {
    const { error, info } = this.props;
    console.log("message state:", {error, info});

    let message = null;
    let clearMessage = () => {};
    let errorNotice = null;

    if (error.length) {
      let index = error.length - 1;
      message = error[index];
      clearMessage = () => this.props.clearErrorMessage(index);
      errorNotice = <Text>Error:</Text>
    } else if (info.length) {
      let index = info.length - 1;
      message = info[index];
      clearMessage = () => this.props.clearInfoMessage(index);
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
    );
  }

}

const styles = StyleSheet.create({
  messageArea: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-around',
  }
});

const mapStateToProps = (state) => {
  return {
    error: state.messages.error,
    info: state.messages.info,
  };
};

const mapDispatchToProps = {
  clearErrorMessage,
  clearInfoMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageOverlay);
import React, { Component } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { startGame } from "../data/parse-client/actions";

class StartGameOverlay extends Component {
  constructor() {
    super();

    this.state = {
      showOverlay: false,
    };
  }
  render() {
    const { showOverlay } = this.state;
    return (
      <View>
        <Button title="Show Overlay" onPress={ () => this.setState({ showOverlay: true })} />
        <Overlay
          isVisible={ showOverlay }
          onBackdropPress={ () => this.setState({ showOverlay: false }) }
        >
          <View style={styles.buttonSection}>
            <Button title="Random Opponent" onPress={ () => console.log('rando')} />
            <View style={styles.buttonSpacer}>
              <Button title="Play a Friend" onPress={ () => console.log('with friend')} />
            </View>
            <Button title="Find by Username" onPress={ () => console.log('search by username')} />
          </View>
        </Overlay>
      </View>
    );
  }

  static propTypes = {
    show: PropTypes.bool,
  }
}

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

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  startGame,
};

export default connect(mapStateToProps, mapDispatchToProps)(StartGameOverlay);
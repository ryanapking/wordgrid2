import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { withRouter } from 'react-router-native';
import { Icon } from 'react-native-elements';

class TopBar extends Component {
  render() {
    return (
      <View style={styles.view}>
        <Icon type='MaterialCommunityIcons' name='menu' style={styles.menuButton} onPress={() => this.props.openDrawer()} />
        <Text style={styles.title} >Title</Text>
        <Icon type='MaterialCommunityIcons' name='home' style={styles.homeButton} onPress={() => this.props.history.push('/')} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  homeButton: {
    paddingRight: 10,
    textAlign: 'right',
  },
  menuButton: {
    paddingLeft: 10,
  },
  title: {
    textAlign: 'center',
  },
  titleContainer: {
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

export default withRouter(TopBar);
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';

class NavMenu extends Component {

  render() {
    return (
      <View style={styles.container}>
        <ListItem title="Games" onPress={() => this.navigateTo(`/games`)} />
        <ListItem title="Settings" onPress={() => this.navigateTo('/settings')} />
      </View>
    );
  }

  navigateTo(route) {
    this.props.closeDrawer();
    this.props.history.push(route);
  }

}

const styles = StyleSheet.create({
  navItem: {

  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  }
});

export default withRouter(NavMenu);
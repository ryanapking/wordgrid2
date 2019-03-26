import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { withRouter } from 'react-router-native';
import PropTypes from 'prop-types';

class NavMenu extends Component {

  render() {
    return (
      <View style={styles.container}>
        <ListItem title="Games" onPress={() => this.navigateTo(`/games`)} />
        <ListItem title="Account" onPress={() => this.navigateTo('/account')} />
      </View>
    );
  }

  navigateTo(route) {
    this.props.closeNavMenu();
    this.props.history.push(route);
  }

  static propTypes = {
    closeNavMenu: PropTypes.func.isRequired
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
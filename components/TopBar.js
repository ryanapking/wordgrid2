import React, { Component } from 'react';
import { View } from 'react-native';
import { withRouter } from 'react-router-native';
import { Header } from 'react-native-elements';

class TopBar extends Component {
  render() {
    return (
      <View>
        <Header
          placement="center"
          leftComponent={{
            icon: 'menu',
            type: 'MaterialCommunityIcons',
            color: '#fff',
            onPress: () => this.props.openDrawer()
          }}
          centerComponent={{
            text: 'Wordgrid 2',
            style: { color: '#fff' }
          }}
          rightComponent={{
            icon: 'home',
            type: 'MaterialCommunityIcons',
            color: '#fff',
            onPress: () => this.props.history.push('/')
          }}
          statusBarProps={{ hidden: true }}
          containerStyle={{ height: '100%', marginTop: 0, paddingTop: 0 }}
        />
      </View>
    );
  }
}

export default withRouter(TopBar);
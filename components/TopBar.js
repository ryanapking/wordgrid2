import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';
import { Header, Icon, Text } from 'react-native-elements';

class TopBar extends Component {
  render() {
    return (
      <View>
        <Header
          placement="center"
          leftComponent={
            <View style={styles.iconSection}>
              <Icon
                type='MaterialCommunityIcons'
                name='arrow-back'
                onPress={ () => console.log('back arrow pressed') }
                iconStyle={styles.icon}
              />
              <View style={styles.textSection}>
                <Text style={styles.text}>Back Title</Text>
              </View>
            </View>
          }
          centerComponent={{
            text: 'Route Title',
            style: { color: '#fff' }
          }}
          rightComponent={{
            icon: 'menu',
            type: 'MaterialCommunityIcons',
            color: '#fff',
            onPress: () => this.props.openDrawer()
          }}
          statusBarProps={{ hidden: true }}
          containerStyle={{ height: '100%', marginTop: 0, paddingTop: 0 }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconSection: {
    flexDirection: 'row',
  },
  icon: {
    color: '#fff',
  },
  text: {
    color: '#fff',
  },
  textSection: {
    justifyContent: 'center',
  },
});

export default withRouter(TopBar);
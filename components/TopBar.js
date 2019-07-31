import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';
import { Header, Icon, Text } from 'react-native-elements';
import PropTypes from 'prop-types';

class TopBar extends Component {
  render() {
    const { backPath, backTitle, routeTitle } = this.props;
    return (
      <Header
        placement="center"
        leftComponent={ !backPath ? null :
          <View style={styles.iconSection}>
            <Icon
              type='MaterialCommunityIcons'
              name='arrow-back'
              onPress={ () => this.props.history.push(backPath) }
              iconStyle={styles.icon}
            />
            <View style={styles.textSection}>
              <Text style={styles.text}>{ backTitle }</Text>
            </View>
          </View>
        }
        centerComponent={{
          text: routeTitle,
          style: { color: '#fff' }
        }}
        rightComponent={{
          icon: 'menu',
          type: 'MaterialCommunityIcons',
          color: '#fff',
          onPress: () => this.props.openMenu()
        }}
        statusBarProps={{ hidden: true }}
        containerStyle={{ height: '100%', marginTop: 0, paddingTop: 0 }}
      />
    );
  }

  static propTypes = {
    backPath: PropTypes.string,
    backTitle: PropTypes.string,
    routeTitle: PropTypes.string,
    openMenu: PropTypes.func.isRequired,
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
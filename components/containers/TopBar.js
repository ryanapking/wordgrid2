import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { withRouter, matchPath } from 'react-router-native';
import { Header, Icon, Text } from 'react-native-elements';
import PropTypes from 'prop-types';

import routes from '../../routes';

class TopBar extends Component {
  render() {
    const { currentRouteKey, backRouteKey } = this.props;
    const currentRoute = routes[currentRouteKey];

    return (
      <Header
        placement="center"
        leftComponent={ !backRouteKey ? null :
          <View style={styles.iconSection}>
            <Icon
              type='MaterialCommunityIcons'
              name='arrow-back'
              onPress={ () => this.navigateBack() }
              iconStyle={styles.icon}
            />
            <View style={styles.textSection}>
              <Text style={styles.text}>{ this.getBackTitle() }</Text>
            </View>
          </View>
        }
        centerComponent={{
          text: currentRoute.routeTitle,
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

  getPreviousPageTitle() {
    const { history } = this.props;
    const previousPage = history.entries[history.entries.length - 2];

    if (!previousPage) return;

    let previousRoute;
    for (let routeKey in routes) {
      const route = routes[routeKey];
      const match = matchPath(previousPage.pathname, {
        path: route.path,
        exact: true,
        strict: false,
      });
      if (match) {
        previousRoute = route;
        break;
      }
    }

    if (previousRoute) return previousRoute.routeTitle;
    else return "";
  }

  getBackTitle() {
    const { backRouteKey } = this.props;

    if (backRouteKey === "|previousPage|") {
      return this.getPreviousPageTitle();
    } else if (!backRouteKey) {
      return "";
    } else {
      return routes[backRouteKey].routeTitle;
    }
  }

  navigateBack() {
    const { backRouteKey, history } = this.props;
    if ( backRouteKey === "|previousPage|") {
      history.push(history.entries[history.entries.length - 2]);
    } else {
      history.push(routes[backRouteKey].path);
    }
  }

  static propTypes = {
    openMenu: PropTypes.func.isRequired,
    currentRouteKey: PropTypes.string.isRequired,
    backRouteKey: PropTypes.string,
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
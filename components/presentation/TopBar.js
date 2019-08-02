import React from 'react';
import { View, StyleSheet } from 'react-native';
import { matchPath } from 'react-router-native';
import { Header, Icon, Text } from 'react-native-elements';
import PropTypes from 'prop-types';

import routes from '../../routes';
import { useHistory } from "../hooks/tempReactRouter";

const TopBar = props => {
  const history = useHistory();
  const { currentRouteKey, backRouteKey } = props;
  const currentRoute = routes[currentRouteKey];

  return (
    <Header
      placement="center"
      leftComponent={ !backRouteKey ? null :
        <View style={styles.iconSection}>
          <Icon
            type='MaterialCommunityIcons'
            name='arrow-back'
            onPress={ () => navigateBack(history, backRouteKey) }
            iconStyle={styles.icon}
          />
          <View style={styles.textSection}>
            <Text style={styles.text}>{ getBackTitle(history, backRouteKey) }</Text>
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
        onPress: () => props.openMenu()
      }}
      statusBarProps={{ hidden: true }}
      containerStyle={{ height: '100%', marginTop: 0, paddingTop: 0 }}
    />
  );
};

TopBar.propTypes = {
  openMenu: PropTypes.func.isRequired,
  currentRouteKey: PropTypes.string.isRequired,
  backRouteKey: PropTypes.string,
};

const getPreviousPageTitle = (history) => {
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
};

const getBackTitle = (history, backRouteKey) => {
  if (backRouteKey === "|previousPage|") {
    return getPreviousPageTitle(history);
  } else if (!backRouteKey) {
    return "";
  } else {
    return routes[backRouteKey].routeTitle;
  }
};

const navigateBack = (history, backRouteKey) => {
  if ( backRouteKey === "|previousPage|") {
    history.push(history.entries[history.entries.length - 2]);
  } else {
    history.push(routes[backRouteKey].path);
  }
};

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

export default TopBar;
import React from 'react';
import { StyleSheet, View} from "react-native";
import { ListItem } from "react-native-elements";
import PropTypes from 'prop-types';

import routes from "../../routes";

const MenuGlobal = props => {
  return (
    <View>
      <ListItem title="Navigate" containerStyle={styles.divider} />
      <ListItem title="Games" onPress={() => props.navigateTo(routes.home.path)} />
      <ListItem title="Account" onPress={() => props.navigateTo(routes.account.path)} />
      <ListItem title="Friends" onPress={() => props.navigateTo(routes.friends.path)} />
    </View>
  )
};

MenuGlobal.propTypes = {
  navigateTo: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  navItem: {

  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  disabledTitle: {
    color: 'lightgray',
  },
  divider: {
    backgroundColor: 'lightgray',
  },
});

export default MenuGlobal;
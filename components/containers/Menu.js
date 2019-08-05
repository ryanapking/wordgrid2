import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { useHistory } from "../hooks/tempReactRouter";
import MenuGlobal from "../presentation/MenuGlobal";
import MenuGame from "../presentation/MenuGame";

const Menu = props => {
  const history = useHistory();
  const navigateTo = (route) => {
    props.closeNavMenu();
    history.push(route);
  };
  return (
    <View style={styles.container}>
      <MenuGame
        closeMenu={ () => props.closeNavMenu() }
      />
      <MenuGlobal
        navigateTo={ (route) => navigateTo(route) }
      />
    </View>
  )
};

Menu.propTypes = {
  closeNavMenu: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
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

export default Menu;
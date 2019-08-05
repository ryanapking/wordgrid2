import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Overlay } from "react-native-elements";
import PropTypes from 'prop-types';

import TopBar from "../components/presentation/TopBar";
import Menu from "../components/containers/Menu";
import MessageOverlay from "../components/presentation/MessageOverlay";

const RouteContainer = props => {
  const [ menuOverlayVisible, setMenuOverlayVisible] = useState(false);
  const { currentRouteKey, backRouteKey } = props;
  return (
    <View style={styles.mainContainer}>
      <MessageOverlay />
      <Overlay isVisible={menuOverlayVisible} onBackdropPress={() => setMenuOverlayVisible(false) }>
        <Menu closeNavMenu={ () => setMenuOverlayVisible(false) }/>
      </Overlay>
      <View style={styles.topBarSection}>
        <TopBar
          openMenu={() => setMenuOverlayVisible(true)}
          currentRouteKey={currentRouteKey}
          backRouteKey={backRouteKey}
        />
      </View>
      <View style={styles.mainSection}>
        { props.children }
      </View>
    </View>
  )
};

RouteContainer.propTypes = {
  currentRouteKey: PropTypes.string.isRequired,
  backRouteKey: PropTypes.string,
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  topBarSection: {
    flex: 5,
  },
  mainSection: {
    flex: 95,
  },
});

export default RouteContainer;
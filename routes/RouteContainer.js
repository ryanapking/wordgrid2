import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Overlay } from "react-native-elements";
import PropTypes from 'prop-types';

import { routeType } from "../proptypes";
import TopBar from "../components/TopBar";
import Menu from "../components/Menu";
import MessageOverlay from "../components/MessageOverlay";

export default class RouteContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOverlayVisible: false,
    }
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <MessageOverlay />
        <Overlay isVisible={this.state.menuOverlayVisible} onBackdropPress={() => this.setState({ menuOverlayVisible: false })}>
          <Menu closeNavMenu={ () => this.setState({ menuOverlayVisible: false }) }/>
        </Overlay>
        <View style={styles.topBarSection}>
          <TopBar
            openMenu={() => this.setState({ menuOverlayVisible: true })}
            currentRouteKey={this.props.currentRouteKey}
            backRouteKey={this.props.backRouteKey}
          />
        </View>
        <View style={styles.mainSection}>
          { this.props.children }
        </View>
      </View>
    )
  }

  static propTypes = {
    currentRouteKey: PropTypes.string.isRequired,
    backRouteKey: PropTypes.string,
  }
}

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
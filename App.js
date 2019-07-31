import React, { Component } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { NativeRouter, Route } from'react-router-native';
import { Overlay } from 'react-native-elements';

import configureStore from './data/redux/configureStore';
import { routesArray, RouteComponents } from './routes';
import Menu from './components/Menu';
import TopBar from './components/TopBar';
import MessageOverlay from './components/MessageOverlay';
import LoginRedirect from "./components/nondisplay/LoginRedirect";

const store = configureStore();

StatusBar.setHidden(true, null);
console.disableYellowBox = true;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOverlayVisible: false
    }
  }
  render() {
    return (
      <Provider store={store}>
        <NativeRouter>
          <View>
            <Overlay isVisible={this.state.menuOverlayVisible} onBackdropPress={() => this.setState({ menuOverlayVisible: false })}>
              <Menu closeNavMenu={ () => this.setState({ menuOverlayVisible: false }) }/>
            </Overlay>
            <MessageOverlay />
            <View style={styles.mainContainer}>
              <View style={styles.topBarSection}>
                <TopBar openDrawer={() => this.setState({ menuOverlayVisible: true })} />
              </View>
              <View style={styles.mainSection}>
                { routesArray.map((route, index) =>
                  <Route
                    key={index}
                    exact
                    path={route.path}
                    render={ () => {
                      const RouteComponent = RouteComponents[route.componentName];
                      return <RouteComponent currentRoute={route} />;
                    }}
                  />
                )}
              </View>
            </View>
            <LoginRedirect />
          </View>
        </NativeRouter>
      </Provider>
    );
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
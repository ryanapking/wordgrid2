import React, { Component } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { NativeRouter, Route } from'react-router-native';
import { Drawer } from 'native-base';

import configureStore from './data/redux/configureStore';

// routes
import Home from "./routes/Home";
import Login from "./routes/Login";
import Game from "./routes/Game";
import GameReview from './routes/GameReview';
import Games from "./routes/Games";
import Settings from "./routes/Settings";
import Challenge from "./routes/Challenge";

// redirect all non-logged in users to the login screen
import LoginRedirect from "./components/nondisplay/LoginRedirect";
import NavMenu from './components/NavMenu';
import TopBar from './components/TopBar';

export const store = configureStore();

StatusBar.setHidden(true);
console.disableYellowBox = true;

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <NativeRouter>
          <Drawer
            ref={(ref) => { this.drawer = ref; }}
            content={<NavMenu closeDrawer={() => this.closeDrawer()}/>}
            onClose={() => this.closeDrawer()}
            acceptPan={false}
          >
            <View style={styles.mainContainer}>
              <View style={styles.topBarSection} >
                <TopBar openDrawer={() => this.openDrawer()} />
              </View>
              <View style={styles.mainSection}>
                <Route exact path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/game/:gameID" component={Game} />
                <Route path="/gameReview/:gameID" component={GameReview} />
                <Route path="/games" component={Games} />
                <Route path="/settings" component={Settings} />
                <Route path="/challenge" component={Challenge} />
              </View>
            </View>
            <LoginRedirect />
          </Drawer>
        </NativeRouter>
      </Provider>
    );
  }
  closeDrawer() {
    this.drawer._root.close()
  }

  openDrawer() {
    this.drawer._root.open()
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
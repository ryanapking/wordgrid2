import React, { Component } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { NativeRouter, Route } from'react-router-native';
import { Drawer } from 'native-base';

import configureStore from './store/configureStore';

// routes
import Home from "./routes/Home";
import Login from "./routes/Login";
import Game from "./routes/Game";
import GameReview from './routes/GameReview';
import Games from "./routes/Games";
import Settings from "./routes/Settings";

// redirect all non-logged in users to the login screen
import LoginRedirect from "./components/nondisplay/LoginRedirect";
import FirebaseListeners from './components/nondisplay/FirebaseListeners';
import NavMenu from './components/NavMenu';
import TopBar from './components/TopBar';

const store = configureStore();

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
            <TopBar openDrawer={() => this.openDrawer()} />
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/game/:gameID" component={Game} />
            <Route path="/gameReview/:gameID/:moveIndex" component={GameReview} />
            <Route path="/games" component={Games} />
            <Route path="/settings" component={Settings} />
            <LoginRedirect />
            <FirebaseListeners />
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
  container: {
    marginTop: 25,
    padding: 10,
  },
  header: {
    fontSize: 20,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  subNavItem: {
    padding: 5,
  },
  topic: {
    textAlign: 'center',
    fontSize: 15,
  },
});
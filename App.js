import React, { Component } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { NativeRouter, Route } from'react-router-native';
import { Overlay } from 'react-native-elements';

import configureStore from './data/redux/configureStore';

// routes
import Home from "./routes/Home";
import Login from "./routes/Login";
import Account from "./routes/Account";
import Game from "./routes/Game";
import GameReview from './routes/GameReview';
import Games from "./routes/Games";
import Settings from "./routes/Settings";
import Challenge from "./routes/Challenge";
import ChallengeOverview from "./routes/ChallengeOverview";
import ChallengeAttempts from "./routes/ChallengeAttempts";
import ChallengeAttemptReview from "./routes/ChallengeAttemptReview";

// redirect all non-logged in users to the login screen
import LoginRedirect from "./components/nondisplay/LoginRedirect";
import NavMenu from './components/NavMenu';
import TopBar from './components/TopBar';
import MessageOverlay from './components/MessageOverlay';

export const store = configureStore();

StatusBar.setHidden(true);
console.disableYellowBox = true;

export default class App extends Component {
  constructor() {
    super();

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
              <NavMenu closeNavMenu={ () => this.setState({ menuOverlayVisible: false }) }/>
            </Overlay>
            <MessageOverlay />
            <View style={styles.mainContainer}>
              <View style={styles.topBarSection} >
                <TopBar openDrawer={() => this.setState({ menuOverlayVisible: true })} />
              </View>
              <View style={styles.mainSection}>
                <Route exact path="/" component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/account" component={Account} />
                <Route path="/game/:gameID" component={Game} />
                <Route path="/gameReview/:gameID" component={GameReview} />
                <Route path="/games" component={Games} />
                <Route path="/settings" component={Settings} />
                <Route path="/challenge" component={Challenge} />
                <Route path="/challengeOverview" component={ChallengeOverview} />
                <Route path="/challengeAttempts/:challengeDate" component={ChallengeAttempts} />
                <Route path="/challengeAttemptReview/:challengeDate/:attemptIndex" component={ChallengeAttemptReview} />
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
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
import Friends from "./routes/Friends";
import Friend from "./routes/Friend";
import FriendArchive from "./routes/FriendArchive";
import Game from "./routes/Game";
import GameArchive from "./routes/GameArchive";
import GameReview from './routes/GameReview';
import Games from "./routes/Games";
import Challenges from "./routes/Challenges";
import Challenge from "./routes/Challenge";
import ChallengeAttempt from "./routes/ChallengeAttempt";
import ChallengeAttemptReview from "./routes/ChallengeAttemptReview";

// redirect all non-logged in users to the login screen
import LoginRedirect from "./components/nondisplay/LoginRedirect";
import Menu from './components/Menu';
import TopBar from './components/TopBar';
import MessageOverlay from './components/MessageOverlay';

const store = configureStore();

StatusBar.setHidden(true, null);
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
              <Menu closeNavMenu={ () => this.setState({ menuOverlayVisible: false }) }/>
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
                <Route path="/friends" component={Friends} />
                <Route exact path="/friend/:friendID" component={Friend} />
                <Route path="/friend/:friendID/archive" component={FriendArchive} />
                <Route path="/game/:gameID" component={Game} />
                <Route path="/games/archive" component={GameArchive} />
                <Route path="/gameReview/:gameID" component={GameReview} />
                <Route exact path="/games" component={Games} />
                <Route path="/challenges" component={Challenges} />
                <Route path="/challenge/:challengeID" component={Challenge} />
                <Route path="/challengeAttempt" component={ChallengeAttempt} />
                <Route exact path="/challengeAttemptReview/:attemptID" component={ChallengeAttemptReview} />
                <Route exact path="/challengeAttemptReview/:challengeID/:attemptIndex" component={ChallengeAttemptReview} />
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
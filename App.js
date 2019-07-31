import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NativeRouter, Route } from'react-router-native';

import configureStore from './data/redux/configureStore';
import routes, { routesArray, RouteComponents } from './routes';
import LoginRedirect from "./components/nondisplay/LoginRedirect";
import RouteContainer from "./routes/RouteContainer";

const store = configureStore();

StatusBar.setHidden(true, null);
console.disableYellowBox = true;

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <NativeRouter>
          <LoginRedirect />
          { routesArray.map((route, index) =>
            <Route
              key={index}
              exact
              path={route.path}
              render={ () => {
                const RouteComponent = RouteComponents[route.componentName];
                return (
                  <RouteContainer currentRoute={route} backRoute={ routes[route.backRoute] } >
                    <RouteComponent />
                  </RouteContainer>
                );
              }}
            />
          )}
        </NativeRouter>
      </Provider>
    );
  }
}
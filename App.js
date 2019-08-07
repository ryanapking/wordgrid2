import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NativeRouter, Route } from'react-router-native';

import configureStore from './data/redux/configureStore';
import { routesArray } from './routes';
import RouteComponents from "./routes/RouteComponents";
import LoginRedirect from "./components/LoginRedirect";
import RouteContainer from "./routes/RouteContainer";

const store = configureStore();

StatusBar.setHidden(true, null);
console.disableYellowBox = true;

const App = () => {
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
                <RouteContainer currentRouteKey={route.routeKey} backRouteKey={ route.backRouteKey } >
                  <RouteComponent />
                </RouteContainer>
              );
            }}
          />
        )}
      </NativeRouter>
    </Provider>
  );
};

export default App;
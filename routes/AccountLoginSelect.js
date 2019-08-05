import React from "react";
import { StyleSheet, View, Button, ActivityIndicator } from "react-native";
import { useSelector, shallowEqual } from "react-redux";

import routes from '.';
import { useHistory } from "../components/hooks/tempReactRouter";

const AccountLoginSelect = () => {
  const fetchingUser = useSelector(state => state.user.fetchingUser, shallowEqual);
  const history = useHistory();

  if (fetchingUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        title="Login with Username & Password"
        onPress={ () => history.push(routes.accountLoginStandard.path)}
      />
      <View style={{ marginTop: 10, marginBottom: 10 }}>
        <Button
          title="Create Account"
          onPress={ () => history.push(routes.accountCreate.path)}
        />
      </View>
      <Button
        title="Login Anonymously"
        onPress={ () => history.push(routes.accountLoginAnonymous.path)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
});

export default AccountLoginSelect;
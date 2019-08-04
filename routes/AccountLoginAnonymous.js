import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import routes from '.';
import Text from "../components/presentation/Text";
import { useHistory } from "../components/hooks/tempReactRouter";
import { userAnonymousLogin } from "../data/redux/thunkedUserActions";

const AccountLoginAnonymous = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <View style={styles.container}>
      <Text centered>Your games will be saved on this phone until your account is registered. Would you like to continue?</Text>
      <View style={styles.buttonSection}>
        <Button title="Login Anonymously" onPress={ () => dispatch(userAnonymousLogin(history)) } />
      </View>
      <Button title="Cancel" onPress={ () => history.push(routes.accountLoginSelect.path) } />
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
  buttonSection: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default AccountLoginAnonymous;
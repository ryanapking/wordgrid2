import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import AccountLoginForm from "../components/presentation/AccountLoginForm";
import routes from '.';
import { userStandardLogin } from "../data/redux/thunkedUserActions";
import { useHistory } from "../components/hooks/tempReactRouter";

const AccountLoginStandard = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <View style={styles.container}>
      <AccountLoginForm
        formAction={ (username, password) => dispatch(userStandardLogin(username, password, history)) }
      />
      <View style={styles.buttonSection}>
        <Button title="Cancel" onPress={ () => history.push(routes.accountLoginSelect.path) } />
      </View>
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

export default AccountLoginStandard;
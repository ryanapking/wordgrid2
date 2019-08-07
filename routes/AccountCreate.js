import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import routes from '.';
import { useHistory } from "../hooks/tempReactRouter";
import AccountRegisterForm from "../components/AccountRegisterForm";
import { userCreateAccount } from "../data/redux/thunkedUserActions";

const AccountCreate = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  return(
    <View style={styles.container}>
      <AccountRegisterForm
        buttonText="Create Account"
        formAction={ (email, username, password) => dispatch(userCreateAccount(email, username, password, history)) }
      />
      <View style={styles.buttonSection}>
        <Button title="Cancel" onPress={ () => history.push(routes.accountLoginSelect.path)} />
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

export default AccountCreate;
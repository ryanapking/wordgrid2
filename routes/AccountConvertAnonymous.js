import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { convertAnonymousAccount } from "../data/redux/thunkedUserActions";
import AccountRegisterForm from "../components/presentation/AccountRegisterForm";

const AccountConvertAnonymous = () => {
  const dispatch = useDispatch();
  return (
    <View style={styles.container}>
      <AccountRegisterForm
        buttonText="Register Account"
        formAction={ (email, username, password) => dispatch(convertAnonymousAccount(email, username, password)) }
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

export default AccountConvertAnonymous;
import React from 'react';
import { View, Button } from 'react-native';
import { useDispatch } from 'react-redux';

import routes from "./index";
import Text from '../components/Text';
import { useHistory } from "../hooks/tempReactRouter";
import { userLogout } from "../data/redux/thunkedUserActions";

const AccountAnonymous = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <View style={{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ marginTop: 10, marginBottom: 10, }}>
        <Button
          title="Register Account"
          onPress={ () => history.push(routes.accountConvertAnonymous.path) }
        />
        <Button
          title="Log Out"
          onPress={ () => dispatch(userLogout()) }
        />
        <Text>You are logged in anonymously. All data is stored on this phone, and if you are logged out, you will have no way to retrieve it. Consider registering your account. Your existing games will come with you.</Text>
      </View>
    </View>
  );
};

export default AccountAnonymous;
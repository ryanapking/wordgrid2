import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useDispatch } from 'react-redux';

import routes from "./index";
import AccountLogoutButton from "../components/presentation/AccountLogoutButton";
import { useHistory } from "../components/hooks/tempReactRouter";
import { setInfoMessage } from "../data/redux/messages";

const AccountAnonymous = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [logoutConfirmationDisplayed, setLogoutConfirmationDisplayed] = useState(false);
  const confirmLogout = () => {
    const logoutConfirmMessage = 'Your account has not been registered. Logging out now will lose all game data. You will not have any way to log back in. Please register your account. After dismissing this message, either cancel your logout request or confirm.';

    dispatch(setInfoMessage(logoutConfirmMessage));
    setLogoutConfirmationDisplayed(true);
  };
  return (
    <View>
      <Text>You are logged in anonymously. All data is stored on this phone, and if you are logged out, you will have no way to retrieve it. Consider registering your account. Your existing games will come with you.</Text>
      <View style={{ marginTop: 10, marginBottom: 10 }}>
        <AccountLogoutButton
          title={ logoutConfirmationDisplayed ? "Logout and Lose Data" : null }
          onPress={ logoutConfirmationDisplayed ? null : confirmLogout }
        />
      </View>
      { logoutConfirmationDisplayed
        ? <Button title="Cancel Logout" onPress={ () => setLogoutConfirmationDisplayed(false) } />
        : <Button title="Register Account" onPress={ () => history.push(routes.accountConvertAnonymous.path) } />
      }
    </View>
  );
};

export default AccountAnonymous;
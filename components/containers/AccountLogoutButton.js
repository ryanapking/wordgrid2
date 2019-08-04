import React from 'react';
import { Button } from 'react-native';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { userLogout } from "../../data/redux/thunkedUserActions";

const AccountLogoutButton = props => {
  const dispatch = useDispatch();
  const { title, onPress } = props;

  return (
    <Button
      title={ title ? title : "Log Out" }
      onPress={ onPress ? onPress : () => dispatch(userLogout()) }
    />
  );
};

AccountLogoutButton.propTypes = {
  title: PropTypes.string,
  onPress: PropTypes.func,
};

export default AccountLogoutButton;
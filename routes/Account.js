import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import AccountUpdateForm from '../components/presentation/AccountUpdateForm';

const Account = () => {
  const user = useSelector(state => state.user, shallowEqual);
  return (
    <AccountUpdateForm
      email={user.email}
      username={user.username}
    />
  );
};

export default Account;
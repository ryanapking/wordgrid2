import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import routes from '../routes';
import { fetchUser } from "../data/redux/thunkedUserActions";
import { useRouter } from "../hooks/tempReactRouter";

const loginPaths = [
  routes.accountCreate.path,
  routes.accountLoginAnonymous.path,
  routes.accountLoginSelect.path,
  routes.accountLoginStandard.path,
];

const anonymousPaths = [
  routes.accountAnonymous.path,
  routes.accountConvertAnonymous.path,
];

const registeredAccountPaths = [
  routes.account.path,
  routes.accountEdit.path,
];

const LoginRedirect = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [uid, isAnonymous] = useSelector(state => [state.user.uid, state.user.isAnonymous], shallowEqual);

  // fetch and refresh user info on initial mount
  useEffect(() => {
    dispatch(fetchUser(router.history))
  }, []);

  // reroute application if needed when the user or route update
  useEffect(() => {
    const { pathname: currentPath } = router.location;
    const onLoginPath = loginPaths.includes(currentPath);
    if (!uid && !onLoginPath) {
      // redirect logged-out user to login page
      router.history.push(routes.accountLoginSelect.path);
    } else if (uid && onLoginPath) {
      // redirect logged-in user to homepage
      router.history.push(routes.home.path);
    } else if (isAnonymous && registeredAccountPaths.includes(currentPath)) {
      // redirect anonymous user from account to anonymous account route
      router.history.push(routes.accountAnonymous.path);
    } else if (!isAnonymous && anonymousPaths.includes(currentPath)) {
      // redirect non-anonymous user from anonymous account to account route
      router.history.push(routes.account.path);
    }
  });

  return null;
};

export default LoginRedirect;
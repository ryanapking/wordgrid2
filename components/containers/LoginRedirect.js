import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import routes from '../../routes';
import { fetchUser } from "../../data/redux/thunkedUserActions";

const allowedPaths = [
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

class LoginRedirect extends Component {
  componentDidMount() {
    // we send the history object so the user can be routed to newly created games
    this.props.fetchUser(this.props.history);
  }
  componentDidUpdate() {
    const { uid, isAnonymous } = this.props.user;
    const { pathname: currentPath } = this.props.location;
    const onLoginPath = allowedPaths.includes(currentPath);
    if (!uid && !onLoginPath) {
      // redirect logged-out user to login page
      this.props.history.push(routes.accountLoginSelect.path);
    } else if (uid && onLoginPath) {
      // redirect logged-in user to homepage
      this.props.history.push(routes.home.path);
    } else if (isAnonymous && registeredAccountPaths.includes(currentPath)) {
      // redirect anonymous user from account to anonymous account route
      this.props.history.push(routes.accountAnonymous.path);
    } else if (!isAnonymous && anonymousPaths.includes(currentPath)) {
      // redirect non-anonymous user from anonymous account to account route
      this.props.history.push(routes.account.path);
    }
  }
  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
};

const mapDispatchToProps = {
  fetchUser
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginRedirect));
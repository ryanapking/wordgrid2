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

class LoginRedirect extends Component {
  componentDidMount() {
    // we send the history object so the user can be routed to newly created games
    this.props.fetchUser(this.props.history);
  }
  componentDidUpdate() {
    const { uid } = this.props.user;
    const onLoginPath = allowedPaths.includes(this.props.location.pathname);
    if (!uid && !onLoginPath) {
      // console.log('redirecting to login...');
      this.props.history.push(routes.accountLoginSelect.path);
    } else if (uid && onLoginPath) {
      // console.log('login successful, redirecting home...');
      this.props.history.push(routes.home.path);
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
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { fetchUser } from "../../data/redux/user";

class LoginRedirect extends Component {
  componentDidMount() {
    // we send the history object so the user can be routed to newly created games
    this.props.fetchUser(this.props.history);
  }
  componentDidUpdate() {
    const uid = this.props.user.uid;
    const onLoginPath = (this.props.location.pathname === "/login");
    if (!uid && !onLoginPath) {
      // console.log('redirecting to login...');
      this.props.history.push("/login");
    } else if (uid && onLoginPath) {
      // console.log('login successful, redirecting home...');
      this.props.history.push("/");
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
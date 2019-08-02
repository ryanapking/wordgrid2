import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import routes from '.';
import { setInfoMessage, setErrorMessage } from "../data/redux/messages";
import { getCurrentUser } from "../data/parse-client/user";
import AccountUpdateForm from '../components/containers/AccountUpdateForm';

class Account extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      fetchingUser: true,
    };
  }

  componentDidMount() {
    this.fetchAccountInfo().then();
  }

  render() {
    const { user, fetchingUser } = this.state;

    if (fetchingUser) {
      return <ActivityIndicator />;
    }

    return (
      <AccountUpdateForm
        email={user.get('email')}
        username={user.get('username')}
        accountUpdated={ () => this.fetchAccountInfo() }
      />
    );
  }

  async fetchAccountInfo() {
    console.log('fetching account info');
    const user = await getCurrentUser()
      .catch( (err) => {
        console.log('error getting current user:', err);
        // we should just redirect here. the user is not logged in.
        // fetching is a local process, so it's not a matter of internet connectivity
      });

    if (user._isLinked('anonymous')) {
      console.log('user is anonymous, rerouting to appropriate path');
      this.props.history.push(routes.accountAnonymous.path);
      return;
    }

    this.setState({ user, fetchingUser: false });
  }

}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  setInfoMessage,
  setErrorMessage,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Account));
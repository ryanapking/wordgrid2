import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-native';

import { convertAnonymousAccount ,getCurrentUser } from "../data/parse-client/user";
import AccountRegisterForm from "../components/AccountRegisterForm";
import routes from "./index";

class AccountConvertAnonymous extends Component {
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

  componentDidUpdate() {
    const { user } = this.state;
  }

  render() {
    const { fetchingUser, user } = this.state;

    if (fetchingUser) {
      return <ActivityIndicator />;
    }

    if (!user) return null;

    return (
      <View style={styles.container}>
        <AccountRegisterForm
          buttonText="Register Account"
          formAction={ (email, username, password) => this._convertAnonymousAccount(email, username, password) }
        />
      </View>
    );
  }

  async fetchAccountInfo() {
    this.setState({ fetchingUser: true });

    const user = await getCurrentUser()
      .catch((err) => {
        console.log('error getting current user:', err);
        this.setState({ fetchingUser: false });
      });

    if (!user._isLinked("anonymous")) {
      this.props.history.push(routes.account.path);
      return;
    }

    this.setState({ user, fetchingUser: false });
  }

  async _convertAnonymousAccount(email, username, password) {
    this.setState({ fetchingUser: true });

    await convertAnonymousAccount(email, username, password)
      .catch( (err) => {
        this.setState({ fetchingUser: false });
        this.props.setErrorMessage(err.toString());
      });

    this.fetchAccountInfo();
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
});

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {

};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountConvertAnonymous));
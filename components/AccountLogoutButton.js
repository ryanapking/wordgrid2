import React, { Component } from 'react';
import { Button } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { logout } from "../data/parse-client/user";
import { userLoggedOut } from "../data/redux/user";
import { removeAllLocalGames } from "../data/redux/gameData";

class AccountLogoutButton extends Component {
  render() {
    const { title, onPress } = this.props;

    // both title and onpress are optional
    // using them to allow for simpler confirmation process with one button

    return (
      <Button
        title={ title ? title : "Log Out" }
        onPress={ onPress ? onPress : () => this.logout() }
      />
    );
  }

  logout() {
    logout()
      .then( () => {
        this.props.userLoggedOut();
        this.props.removeAllLocalGames();
      });
  }

  static propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  userLoggedOut,
  removeAllLocalGames,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountLogoutButton);
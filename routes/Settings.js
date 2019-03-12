import React, { Component } from 'react';
import { withRouter } from 'react-router-native';
import { connect } from 'react-redux';
import { Text, View } from "react-native";
import { Button, Input } from 'react-native-elements';

class Settings extends Component {
  constructor() {
    super();
    this.state = {
      displayName: "",
      newDisplayName: "",
      displayingUserID: null,
      loading: false
    };
  }

  componentDidMount() {
    this.getDisplayName();
  }

  componentDidUpdate() {
    // we might be displaying a different user's settings, though it's not terribly likely
    if (!this.state.loading && this.state.displayingUserID !== this.props.userID) {
      this.getDisplayName();
    }
  }

  render() {

    console.log('state:', this.state);

    if (this.state.loading) {
      return (
        <Text>Loading...</Text>
      );
    } else if (this.state.settingsUserID !== this.props.userID) {
      // this.getSettings();
    }

    return (
      <View>
        <Input
          placeholder="Enter Your Display Name"
          label="Display Name"
          value={this.state.newDisplayName}
          onChangeText={ (newDisplayName) => this.setState({newDisplayName})}
        />
        <Button title="Save" onPress={() => this.saveDisplayName()} />
      </View>
    )
  }

  getDisplayName() {

  }

  saveDisplayName() {

  }

  getSettings() {

  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.uid
  }
};

export default withRouter(connect(mapStateToProps)(Settings));
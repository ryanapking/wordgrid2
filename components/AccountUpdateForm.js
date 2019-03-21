import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Input } from "react-native-elements";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import validator from 'validator';

import { setErrorMessage, setInfoMessage } from "../data/redux/messages";
import { updateExistingAccount } from "../data/parse-client/user";

class AccountUpdateForm extends Component {
  constructor() {
    super();

    this.state = {
      ...this.getInitialState()
    };

  }
  render() {
    const { updateUsername, updateEmail, updatePassword, newUsername, newEmail, newPassword, newRetypePassword } = this.state;
    const { username, email } = this.props;

    const newEmailValid = (newEmail && validator.isEmail(newEmail));
    const newPasswordValid = (newPassword && newPassword === newRetypePassword);

    const formReady = (newEmail || newPassword || newUsername) && (!newEmail || newEmailValid) && (!newPassword || newPasswordValid);

    const lockIcons = {
      username: {
        type: 'MaterialCommunityIcons',
        name: updateUsername ? 'lock-open' : 'lock',
        onPress: () => {
          this.setState({ updateUsername: true });
        },
      },
      email: {
        type: 'MaterialCommunityIcons',
        name: updateEmail ? 'lock-open' : 'lock',
        onPress: () => {
          this.setState({ updateEmail: true });
        },
      },
      password: {
        type: 'MaterialCommunityIcons',
        name: updatePassword ? 'lock-open' : 'lock',
        onPress: () => {
          this.setState({ updatePassword: true });
        },
      }
    };

    return (
      <View style={styles.mainView}>
        <View style={styles.fieldGroup}>
          <Input
            label='Username'
            value={username}
            editable={false}
            rightIcon={lockIcons.username}
          />
          { updateUsername ?
            <Input
              label='New Username'
              editable={true}
              textContentType="username"
              autoCapitalize="none"
              onChangeText={ (newUsername) => this.setState({newUsername}) }
            />
            : null
          }
        </View>
        <View style={styles.fieldGroup}>
          <Input
            label='Email Address'
            value={email}
            editable={false}
            rightIcon={lockIcons.email}
          />
          { updateEmail ?
            <Input
              label='New Email Address'
              errorMessage={ (newEmail && !validator.isEmail(newEmail)) ? 'Invalid email address' : null }
              editable={true}
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={ (newEmail) => this.setState({newEmail}) }
            />
            : null
          }
        </View>
        <View style={styles.fieldGroup}>
          <Input
            label={ updatePassword ? "New Password" : "Password" }
            placeholder={ updatePassword ? null : "*********" }
            textContentType="password"
            autoCapitalize="none"
            editable={updatePassword}
            secureTextEntry={true}
            rightIcon={lockIcons.password}
            onChangeText={ (newPassword) => this.setState({newPassword}) }
          />
          { updatePassword ?
            <Input
              label="Retype New Password"
              textContentType="password"
              autoCapitalize="none"
              editable={true}
              secureTextEntry={true}
              onChangeText={ (newRetypePassword) => this.setState({newRetypePassword}) }
            />
            : null
          }
        </View>
        { (updateUsername || updateEmail || updatePassword) ?
          <View style={styles.saveButton}>
            <Button
              disabled={!formReady}
              title="Save Changes"
              onPress={ () => this.saveChanges() }
            />
          </View>
          : null
        }
        <View style={styles.button}>
          <Button
            title="Log Out"
            onPress={ () => console.log('this button would log the user out...') }
          />
        </View>

      </View>
    );
  }

  saveChanges() {
    const { newEmail, newUsername, newPassword, newRetypePassword } = this.state;

    if (newEmail && !validator.isEmail(newEmail)) return;
    if (newPassword && newPassword !== newRetypePassword) return;

    this.setState({ saving: true });

    updateExistingAccount(newEmail, newUsername, newPassword)
      .then( () => {
        // trigger parent element to get user data, which should be updated
        this.props.accountUpdated();
        this.props.setInfoMessage('Account updated successfully.');
        this.setState({ ...this.getInitialState() });
      })
      .catch( (err) => {
        this.props.setErrorMessage(err);
      })
      .finally( () => {
        this.setState({ saving: false });
      });

  }

  getInitialState() {
    return {
      updateUsername: false,
      updateEmail: false,
      updatePassword: false,

      newUsername: "",
      newEmail: "",
      newPassword: "",
      newRetypePassword: "",

      saving: false,
    };
  }

  static propTypes = {
    email: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    accountUpdated: PropTypes.func.isRequired,
  }
}

styles = StyleSheet.create({
  mainView: {
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  fieldGroup: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {
  setErrorMessage,
  setInfoMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountUpdateForm);
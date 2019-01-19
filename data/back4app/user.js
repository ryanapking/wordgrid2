import { v1 } from 'uuid';

import { AsyncStorage } from 'react-native';
import Parse from 'parse/react-native';

Parse.setAsyncStorage(AsyncStorage);
Parse.serverURL = 'https://parseapi.back4app.com/';
Parse.initialize("lLAluN9aV5JZIiwiQPVsUNxZ6ses5IXgwoWpt2NX", "Wf0JfHZM5E43d4OmJd1bsnDrvTYQNI1UNN29el5K");

export function anonymousLogin() {
  return "anonymousLogin()";
  return new Promise( (resolve, reject) => {
    let user = new Parse.User();
    let authData = {
      "authData": {
        "id": v1()
      }
    };

    user._linkWith("anonymous", authData).then(function(user) {
      resolve(user);
    }).catch((err) => {
      reject(err);
    });
  });
}

export function standardLogin(username, password) {
  return new Promise( (resolve, reject) => {
    new Parse.User.logIn(username, password)
      .then( (response) => {
        resolve(response);
      })
      .catch( (err) => {
        reject(err);
      });
  });
}
import { v1 } from 'uuid';

import Parse from './client-setup';

export function anonymousLogin() {
  // return "anonymousLogin()";
  return new Promise( (resolve, reject) => {
    let user = new Parse.User();
    let authData = {
      "authData": {
        "id": v1()
      }
    };

    console.log("auth data:", authData);

    user._linkWith("anonymous", authData).then(function(user) {
      console.log(user);
    }).catch((err) => {
      console.log(err);
    });
  });
}

export function logout() {
  Parse.User.logOut();
}

export function checkUser() {
  Parse.User.currentAsync()
    .then((something) => {
      console.log('something:', something);
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
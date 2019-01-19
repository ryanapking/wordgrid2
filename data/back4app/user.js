// import { v1 } from 'uuid';
const uuidv1 = require('uuid/v1');

import Parse from './client-setup';

export function anonymousLogin() {
  // return "anonymousLogin()";
  return new Promise( (resolve, reject) => {
    let user = new Parse.User();
    let authData = {
      "authData": {
        "id": uuidv1()
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

export function sampleQuery() {
  const Comment = Parse.Object.extend("test");
  const query = new Parse.Query(Comment);

  query.get("jGGfST3cKc")
    .then( (comment) => {
      console.log('fetched content:', comment.get("content"));
    })
    .catch( (err) => {
      console.log('fetch error:', err);
    });
}

export function startGame() {
  Parse.Cloud.run("startGame")
    .then( (response) => {
      console.log('startGame success:', response);
    })
    .catch( (err) => {
      console.log('startGame error:', err);
    });
}
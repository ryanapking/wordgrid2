import { v1 } from 'uuid';

import Parse from './client-setup';

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
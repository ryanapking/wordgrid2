export { startListeners } from './listeners';
export { getUserName } from './getters';
export { initiateGame } from './initiateGame';
export { saveGame } from './saveGame';
import { v1 } from 'uuid';

import { AsyncStorage } from 'react-native';
import Parse from 'parse/react-native';

// import utilities from '../b4a-cloud-functions/cloud/utilities';
// console.log(utilities.someFunction());

Parse.setAsyncStorage(AsyncStorage);
Parse.serverURL = 'https://parseapi.back4app.com/';
Parse.initialize("lLAluN9aV5JZIiwiQPVsUNxZ6ses5IXgwoWpt2NX", "Wf0JfHZM5E43d4OmJd1bsnDrvTYQNI1UNN29el5K");

// trigger cloud function
Parse.Cloud.run("hello")
  .then( (response) => {
    console.log('hello message:', response);
  })
  .catch( (err) => {
    console.log('error message:', err);
  });

// check current login status
let checkLogin = () => {
  Parse.User.currentAsync()
    .then((something) => {
      console.log('something:', something);
    });
};
// checkLogin();

// create a new random user
let newAnonymousUser = () => {
  let authData = {
    "authData": {
      "id": v1()
    }
  };

  user._linkWith("anonymous", authData).then(function(user) {
    console.log(user);
    checkLogin();
  }).catch(console.error);
};
// newAnonymousUser();

// login with username and password
const userLogin = (username, password) => {
  new Parse.User.logIn(username, password)
    .then( (response) => {
      console.log('login response:', response);
    })
    .catch( (err) => {
      console.log('login error:', err);
    });
};
// userLogin("tpXRxEmoF6iwDaIqpWhnP9MIm", "password");

// Parse.User.logOut();

const sampleQuery = () => {
  const Comment = Parse.Object.extend("Comment");
  const query = new Parse.Query(Comment);

  query.get("Eh7xOLWQdj")
    .then( (comment) => {
      console.log('fetched content:', comment.get("content"));
    })
    .catch( (err) => {
      console.log('fetch error:', err);
    });
};
// sampleQuery();



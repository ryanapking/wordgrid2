// firebase db example. does not yet function as a duck.

import firebase from 'react-native-firebase';

var db = firebase.firestore();

var testCollection = db.collection('test');

testCollection.doc('jane').set({
  lastName: 'keyler', state: 'OR'
});

db.collection('test').get()
  .then((collection) => {
    console.log("get collection success");
    console.log(collection);
  })
  .catch((e) => {
    console.log("get collection error");
    console.log(e);
  });

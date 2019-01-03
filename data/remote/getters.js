import firebase from "react-native-firebase";

export function getUserName(opponentID) {
  return new Promise( (resolve, reject) => {
    firebase.firestore().collection('displayNames')
      .where("id", "==", opponentID)
      .limit(1)
      .get()
      .then( (results) => {
        // console.log('name search complete');
        if (results.docs.length > 0) {
          resolve(results.docs[0].id);
        } else {
          reject('no results');
        }
      })
      .catch( (err) => {
        reject(err);
      });
  });
}


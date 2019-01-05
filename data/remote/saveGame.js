import firebase from "react-native-firebase";

import { store } from '../../App';
import { startSave, endSave } from "../redux/login";

export function saveGame(gameID, gameObject) {
  store.dispatch(startSave());

  firebase.firestore()
    .collection('games')
    .doc(gameID)
    .update({
      ...gameObject,
      m: firebase.firestore.FieldValue.serverTimestamp(), // modification timestamp
    })
    .catch((err) => {
      console.log('game udpate error:', err);
    })
    .finally( () => {
      store.dispatch(endSave());
    });

}
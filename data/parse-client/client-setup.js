import { AsyncStorage } from 'react-native';
import Parse from 'parse/react-native';

Parse.setAsyncStorage(AsyncStorage);
Parse.initialize("RyanAppleKing");

// local development with docker compose
Parse.serverURL = 'http://127.0.0.1:1337/parse';
Parse.liveQueryServerURL = 'ws://127.0.0.1:1338/parse';

// DO hosted kubernetes
// Parse.serverURL = 'https://parse-server.ryanapking.com/parse';
// Parse.liveQueryServerURL = 'wss://parse-livequery.ryanapking.com/parse';

export default Parse;
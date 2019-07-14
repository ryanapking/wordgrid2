import { AsyncStorage } from 'react-native';
import Parse from 'parse/react-native';
import { Constants } from 'expo';

Parse.setAsyncStorage(AsyncStorage);
Parse.initialize("RyanAppleKing");

const ENV = {
  local: {
    serverURL: 'http://127.0.0.1:1337/parse',
    liveQueryServerURL: 'ws://127.0.0.1:1338/parse',
  },
  dev: {
    serverURL: 'https://parse-server.ryanapking.com/parse',
    liveQueryServerURL: 'wss://parse-livequery.ryanapking.com/parse',
  },
  staging: {
    serverURL: 'https://parse-server.ryanapking.com/parse',
    liveQueryServerURL: 'wss://parse-livequery.ryanapking.com/parse',
  },
  prod: {
    serverURL: 'https://parse-server.ryanapking.com/parse',
    liveQueryServerURL: 'wss://parse-livequery.ryanapking.com/parse',
  }
};

let parseURLs;
switch(Constants.manifest.releaseChannel) {
  case "dev":
    parseURLs = ENV.dev;
    break;
  case "staging":
    parseURLs = ENV.staging;
    break;
  case "prod":
    parseURLs = ENV.prod;
    break;
  default:
    parseURLs = ENV.local;
    break;
}

Parse.serverURL = parseURLs.serverURL;
Parse.liveQueryServerURL = parseURLs.liveQueryServerURL;

export default Parse;
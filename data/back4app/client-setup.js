import { AsyncStorage } from 'react-native';
import Parse from 'parse/react-native';

Parse.setAsyncStorage(AsyncStorage);
Parse.serverURL = 'https://parseapi.back4app.com/';
Parse.initialize("lLAluN9aV5JZIiwiQPVsUNxZ6ses5IXgwoWpt2NX", "Wf0JfHZM5E43d4OmJd1bsnDrvTYQNI1UNN29el5K");

export default Parse;
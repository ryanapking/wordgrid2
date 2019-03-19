import { combineReducers } from 'redux';

import user from './user';
import gameData from './gameData';
import gameDisplay from './gameDisplay';
import challengeData from './challengeData';
import messages from './messages';

// reducer
export default combineReducers({
  user: user,
  gameDisplay: gameDisplay,
  gameData: gameData,
  challengeData: challengeData,
  messages: messages,
});

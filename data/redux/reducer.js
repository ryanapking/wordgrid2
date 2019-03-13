import { combineReducers } from 'redux';

import user from './user';
import gameData from './gameData';
import gameDisplay from './gameDisplay';
import challengeData from './challengeData';

// reducer
export default combineReducers({
  user: user,
  gameDisplay: gameDisplay,
  gameData: gameData,
  challengeData: challengeData,
});

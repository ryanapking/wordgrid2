import Parse from './client-setup';

import { store } from '../../App';
import { setLocalGameDataByID, removeLocalGameByID } from '../redux/gameData';

const gameObjectToLocalStorage = (gameObject) => {
  const game = gameObject.toJSON();
  const uid = store.getState().user.uid;
  const action = setLocalGameDataByID(game.objectId, uid, game);
  store.dispatch(action);
};

export async function startGamesLiveQuery(routerHistory) {
  const user = await Parse.User.currentAsync();

  const Games = Parse.Object.extend("Games");

  const p1Games = new Parse.Query(Games).equalTo("player1", user);
  const p2Games = new Parse.Query(Games).equalTo("player2", user);
  const gamesQuery = Parse.Query.or(p1Games, p2Games).include('*');

  const games = await gamesQuery.find();
  games.forEach( (game) => {
    gameObjectToLocalStorage(game);
  });

  let subscription = gamesQuery.subscribe();

  subscription.on('open', () => {
    console.log('live query subscription opened');
  });

  subscription.on('enter', (gameObject) => {
    console.log('subscription enter:', gameObject);
    gameObjectToLocalStorage(gameObject);
  });

  subscription.on('create', (gameObject) => {
    console.log('subscription create: ', gameObject);
    gameObjectToLocalStorage(gameObject);

    // redirect to the new game once it's saved to local storage
    let intervalCounter = 0;
    let waitInterval = setInterval(() => {
      intervalCounter++;
      const gameIDs = Object.keys(store.getState().gameData.byID);
      if (gameIDs.includes(gameObject.id)) {
        routerHistory.push(`/game/${gameObject.id}`);
        clearInterval(waitInterval);
      } else if (intervalCounter > 10) {
        clearInterval(waitInterval);
      }
    }, 250);
  });

  subscription.on('update', (gameObject) => {
    console.log('subscription update: ', gameObject);
    gameObjectToLocalStorage(gameObject);
  });

  subscription.on('leave', (gameObject) => {
    console.log('subscription leave: ', gameObject);
    store.dispatch(removeLocalGameByID(gameObject.id));
  });

  subscription.on('delete', (gameObject) => {
    console.log('subscription delete: ', gameObject);
    store.dispatch(removeLocalGameByID(gameObject.id));
  });

  subscription.on('close', () => {
    console.log('subscription closed');
  });

  return games;

}
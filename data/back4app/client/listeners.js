import Parse from './client-setup';

import { remoteToLocal } from '../cloud/utilities/functions/dataConversions';

export async function startGamesLiveQuery(onChange) {
  const user = await Parse.User.currentAsync();

  const Games = Parse.Object.extend("Games");

  const p1Games = new Parse.Query(Games).equalTo("player1", user).doesNotExist("winner");
  const p2Games = new Parse.Query(Games).equalTo("player2", user).doesNotExist("winner");
  const gamesQuery = Parse.Query.or(p1Games, p2Games);

  const games = await gamesQuery.find();
  games.forEach( (game) => {
    onChange(game.toJSON());
  });

  let subscription = gamesQuery.subscribe();

  subscription.on('open', () => {
    console.log('live query subscription opened');
  });

  subscription.on('enter', (object) => {
    console.log('subscription enter: ', object);
    onChange(object.toJSON());
  });

  subscription.on('create', (object) => {
    console.log('subscription create: ', object);
    onChange(object.toJSON());
  });

  subscription.on('update', (object) => {
    console.log('subscription update: ', object);
    onChange(object.toJSON());
  });

  subscription.on('leave', (object) => {
    console.log('subscription leave: ', object);
  });

  subscription.on('delete', (object) => {
    console.log('subscription delete: ', object);
  });

  subscription.on('close', () => {
    console.log('subscription closed');
  });

}
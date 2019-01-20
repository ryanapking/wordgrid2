import Parse from './client-setup';

import { remoteToLocal } from '../cloud/utilities/functions/dataConversions';

export async function liveQuery() {
  const user = await Parse.User.currentAsync();

  const Games = Parse.Object.extend("Games");

  const p1Games = new Parse.Query(Games).equalTo("player1", user).doesNotExist("winner");
  const p2Games = new Parse.Query(Games).equalTo("player2", user).doesNotExist("winner");
  const gamesQuery = Parse.Query.or(p1Games, p2Games);

  const games = await gamesQuery.find();
  games.forEach( (game) => {
    const gameJSON = game.toJSON();
    remoteToLocal(gameJSON, user.id);

    // console.log(`game ${game.id}:`, gameJSON);
  });

  // let subscription = gamesQuery.subscribe();
  //
  // subscription.on('open', () => {
  //   console.log('live query subscription opened');
  // });
  //
  // subscription.on('enter', (object) => {
  //   console.log('subscription enter: ', object);
  // });
  //
  // subscription.on('create', (object) => {
  //   console.log('subscription create: ', object);
  // });
  //
  // subscription.on('update', (object) => {
  //   console.log('subscription update: ', object);
  // });
  //
  // subscription.on('leave', (object) => {
  //   console.log('subscription leave: ', object);
  // });
  //
  // subscription.on('delete', (object) => {
  //   console.log('subscription delete: ', object);
  // });
  //
  // subscription.on('close', () => {
  //   console.log('subscription closed');
  // });

}
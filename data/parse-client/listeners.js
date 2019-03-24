import Parse from './client-setup';

export async function startGamesLiveQuery(storeGame, storeGameThenRedirect, removeGame, removeAllGames) {
  const user = await Parse.User.currentAsync();

  const Games = Parse.Object.extend("Games");

  const p1Games = new Parse.Query(Games).equalTo("player1", user);
  const p2Games = new Parse.Query(Games).equalTo("player2", user);
  const gamesQuery = Parse.Query.or(p1Games, p2Games).include('*');

  const games = await gamesQuery.find();
  games.forEach( (game) => {
    storeGame(game.toJSON());
  });

  let subscription = gamesQuery.subscribe();

  subscription.on('open', () => {
    console.log('live query subscription opened');
  });

  subscription.on('enter', (gameObject) => {
    console.log('subscription enter:', gameObject);
    storeGame(gameObject.toJSON());
  });

  subscription.on('create', (gameObject) => {
    console.log('subscription create: ', gameObject);
    storeGameThenRedirect(gameObject.toJSON());
  });

  subscription.on('update', (gameObject) => {
    console.log('subscription update: ', gameObject);
    storeGame(gameObject.toJSON());
  });

  subscription.on('leave', (gameObject) => {
    console.log('subscription leave: ', gameObject);
    removeGame(gameObject.id);
  });

  subscription.on('delete', (gameObject) => {
    console.log('subscription delete: ', gameObject);
    removeGame(gameObject.id);
  });

  subscription.on('close', () => {
    console.log('subscription closed');
  });

  return games;

}
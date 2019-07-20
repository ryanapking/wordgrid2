import Parse from './client-setup';

let currentUser = {
  uid: null,
  subscription: null,
};

export function stopGamesLiveQuery() {
  if (currentUser.subscription) {
    console.log('unsubscribing!');
    currentUser.subscription.unsubscribe()
      .then( () => {
        console.log('unsubscribe succeeded!');
        currentUser = {
          uid: null,
          subscription: null,
        };
      })
      .catch( (err) => {
        console.log('unsubscribe error!', err);
      });
  }
}

export async function startGamesLiveQuery(storeGame, storeGameThenRedirect, removeGame, removeAllGames) {
  const user = await Parse.User.currentAsync();

  if (currentUser.subscription) {
    console.log('unsubscribing previous user!');
    removeAllGames(); // this might break stuff if things happen in the wrong order
    currentUser.subscription.unsubscribe();
    currentUser = {
      uid: null,
      subscription: null,
    };
  }

  const Games = Parse.Object.extend("Games");

  // we are listening for games with no winner or games that are not yet archived
  const p1ActiveGames = new Parse.Query(Games).equalTo("player1", user).doesNotExist("winner");
  const p2ActiveGames = new Parse.Query(Games).equalTo("player2", user).doesNotExist("winner");
  const p1RecentGames = new Parse.Query(Games).equalTo("player1", user).notEqualTo("archived", true);
  const p2RecentGames = new Parse.Query(Games).equalTo("player2", user).notEqualTo("archived", true);
  const gamesQuery = new Parse.Query.or(p1ActiveGames, p2ActiveGames, p1RecentGames, p2RecentGames).include('*');

  const games = await gamesQuery.find();

  // save games to Parse local data store
  Parse.Object.pinAll(games)
    .then(() => {
      console.log('all games pinned');
    })
    .catch((err) => {
      console.log('error pinning all games:', err);
    });

  // save games to redux
  games.forEach( (game) => {
    storeGame(game.toJSON());
  });

  currentUser = {
    uid: user.id,
    subscription: await gamesQuery.subscribe(),
  };

  currentUser.subscription.on('open', () => {
    console.log('live query subscription opened');
  });

  currentUser.subscription.on('enter', (gameObject) => {
    console.log('subscription enter:', gameObject);
    // live queries do not support include, so we fetch the other player's name
    gameObject.get('player1')
      .fetch()
      .finally( () => {
        gameObject.pin().then(() => console.log('pinned')).catch();
        storeGameThenRedirect(gameObject.toJSON());
      });
  });

  currentUser.subscription.on('create', (gameObject) => {
    console.log('subscription create: ', gameObject);
    gameObject.get('player1')
      .fetch()
      .finally( () => {
        gameObject.pin().then(() => console.log('pinned')).catch();
        storeGameThenRedirect(gameObject.toJSON());
      });

  });

  currentUser.subscription.on('update', (gameObject) => {
    console.log('subscription update: ', gameObject);
    gameObject.get('player1')
      .fetch()
      .finally( () => {
        gameObject.pin().then(() => console.log('pinned')).catch();
        storeGame(gameObject.toJSON());
      });
  });

  currentUser.subscription.on('leave', (gameObject) => {
    console.log('subscription leave: ', gameObject);
    removeGame(gameObject.id);
  });

  currentUser.subscription.on('delete', (gameObject) => {
    console.log('subscription delete: ', gameObject);
    removeGame(gameObject.id);
  });

  currentUser.subscription.on('close', () => {
    console.log('subscription closed');
  });

  return games;
}
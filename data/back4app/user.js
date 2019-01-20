import { v1 } from 'uuid';
// const uuidv1 = require('uuid/v1');

import Parse from './client-setup';

export function anonymousLogin() {
  // return "anonymousLogin()";
  return new Promise( (resolve, reject) => {
    let user = new Parse.User();
    let authData = {
      "authData": {
        "id": v1()
      }
    };

    console.log("auth data:", authData);

    user._linkWith("anonymous", authData).then(function(user) {
      console.log(user);
    }).catch((err) => {
      console.log(err);
    });
  });
}

export function logout() {
  Parse.User.logOut();
}

export function checkUser() {
  Parse.User.currentAsync()
    .then((something) => {
      console.log('something:', something);
    });
}

export function standardLogin(username, password) {
  return new Promise( (resolve, reject) => {
    new Parse.User.logIn(username, password)
      .then( (response) => {
        resolve(response);
      })
      .catch( (err) => {
        reject(err);
      });
  });
}

export function sampleQuery() {
  const Comment = Parse.Object.extend("test");
  const query = new Parse.Query(Comment);

  query.get("jGGfST3cKc")
    .then( (comment) => {
      console.log('fetched content:', comment.get("content"));
    })
    .catch( (err) => {
      console.log('fetch error:', err);
    });
}

export async function liveQuery() {
  const user = await Parse.User.currentAsync();

  const Games = Parse.Object.extend("Games");

  const p1Games = new Parse.Query(Games).equalTo("player1", user).doesNotExist("winner");
  const p2Games = new Parse.Query(Games).equalTo("player2", user).doesNotExist("winner");
  const gamesQuery = Parse.Query.or(p1Games, p2Games);

  const games = await gamesQuery.find();
  games.forEach( (game) => {
    console.log(`game ${game.id}:`, game.toJSON());
  });


  let subscription = gamesQuery.subscribe();

  subscription.on('open', () => {
    console.log('live query subscription opened');
  });

  subscription.on('enter', (object) => {
    console.log('subscription enter: ', object);
  });

  subscription.on('create', (object) => {
    console.log('subscription create: ', object);
  });

  subscription.on('update', (object) => {
    console.log('subscription update: ', object);
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

export async function startGame() {
  let someValue = await Parse.Cloud.run("startGame")
    .then( (response) => {
      console.log('startGame success:', response);
    })
    .catch( (err) => {
      console.log('startGame error:', err);
    });

  console.log('some value:', someValue);
}

export async function getSomething() {
  let user = await Parse.User.currentAsync();
  console.log('user:', user);

  let gameList = await user.get("gameList");
  console.log('game list:', gameList);

  let fullGameList = await gameList.fetchWithInclude("ready");
  console.log('full game list...', fullGameList.toJSON());
}
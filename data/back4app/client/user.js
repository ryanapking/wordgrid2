import { v1 } from 'uuid';

import Parse from './client-setup';

export async function anonymousLogin() {
    const authData = {
      "authData": {
        "id": v1()
      }
    };

    let user = await new Parse.User()
      ._linkWith("anonymous", authData)
      .catch((err) => {
        throw new Error(err);
      });

    return user.id;
}

export async function logout() {
  return await Parse.User.logOut()
    .catch( (err) => {
      throw new Error(err)
    });
}

export async function checkUser() {
  let user = await Parse.User.currentAsync()
    .catch((err) => {
      throw new Error(err);
    });

  return user.id;
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
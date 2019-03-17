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

export async function createLogin(username, password, email) {

}

export async function linkAnonymousAccount() {
  let user = await getCurrentUser();

  console.log('anonymous user:', user);

  user.set("username", "jimjim");
  user.set("password", "password");
  user.set("email", "jimjim@somefakeemail.com");

  console.log('anonymous with password:', user);


  user = await user.save()
    .catch((err) => {
      throw new Error(err);
    });

  console.log('after password save:', user);

  user = user._unlinkFrom("anonymous")
    .catch((err) => {
      throw new Error(err);
    });

  console.log('after unlink', user);

  return user;
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

export async function getCurrentUser() {
  let user = await Parse.User.currentAsync()
    .catch((err) => {
      console.log('error fetching current user', err);
      throw new Error(err);
    });

  console.log('current user info:', user);

  return user;
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
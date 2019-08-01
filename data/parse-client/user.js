import v1 from 'uuid/v1';

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

  return user.toJSON();
}

export async function createAccount(email, username, password) {
  let user = new Parse.User();

  user.set('email', email, {});
  user.set('username', username, {});
  user.set('password', password, {});

  user = await user.signUp()
    .catch((err) => {
      console.log('error creating account:', err);
      throw new Error(err);
    });

  return user.toJSON();
}

export async function convertAnonymousAccount(email, username, password) {
  let user = await getCurrentUser();

  if (!user._isLinked('anonymous')) {
    throw new Error('Not an anonymous user');
  }

  user.set("email", email);
  user.set("username", username);
  user.set("password", password);

  user = await user.save()
    .catch((err) => {
      throw new Error(err);
    });

  // remove the anonymous login
  user = await user._linkWith('anonymous', { authData: null })
    .catch( (err) => {
      console.log('error unlinking:', err);
      throw new Error(err);
    });

  // fetch the user from remote to remove password data from local object
  user = await user.fetch()
    .catch((err) => {
      console.log('error fetching user:', err);
    });

  return user.toJSON();
}

export async function updateExistingAccount(email = null, username = null, password = null) {
  let user = await getCurrentUser();

  let saveNeeded = false;
  if (email && email !== user.get('email')) {
    user.setEmail(email);
    saveNeeded = true;
  }
  if (username && username !== user.get('username')) {
    user.setUsername(username);
    saveNeeded = true;
  }
  if (password) {
    user.setPassword(password);
    saveNeeded = true;
  }
  if (saveNeeded) {
    return await user.save()
      .then((user) => {
        return user.toJSON();
      })
      .catch( (err) => {
        // if the save failed, the local object is corrupted by the above sets that don't match the server
        user.fetch();
        throw new Error(err);
      });
  } else {
    return user.toJSON();
  }
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

  if (user) {
    return user.toJSON();
  } else {
    return null;
  }
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

export async function standardLogin(username, password) {
  let user = await Parse.User.logIn(username, password, {})
    .catch( (err) => {
      throw new Error(err);
    });

  return user.toJSON();
}

export async function updateLocalUserDataFromParse() {
  let user = await Parse.User.currentAsync()
    .catch((err) => {
      throw new Error(err);
    });

  user = await user.fetchWithInclude(['friendList', 'friendList.friends'])
    .catch((err) => {
      throw new Error(err);
    });

  return user.toJSON();
}
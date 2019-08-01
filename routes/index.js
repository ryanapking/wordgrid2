import AccountConvertAnonymous from "./AccountConvertAnonymous";

const routes = {
  home: {
    routeKey: "home",
    routeTitle: "Games",
    backRouteKey: null,
    path: "/",
    componentName: "Games",
  },
  game: {
    routeKey: "game",
    routeTitle: "vs",
    backRouteKey: "|previousPage|",
    path: "/game/:gameID",
    componentName: "Game",
  },
  gameReview: {
    routeKey: "gameReview",
    routeTitle: "vs Review",
    backRouteKey: "|previousPage|",
    path: "/gameReview/:gameID",
    componentName: "GameReview",
  },
  challenges: {
    routeKey: "challenges",
    routeTitle: "Challenges",
    backRouteKey: "home",
    path: "/challenges",
    componentName: "Challenges",
  },
  challenge: {
    routeKey: "challenge",
    routeTitle: "Challenge",
    backRouteKey: "challenges",
    path: "/challenge/:challengeID",
    componentName: "Challenge",
  },
  challengeAttempt: {
    routeKey: "challengeAttempt",
    routeTitle: "Challenge Attempt",
    backRouteKey: "|previousPage|",
    path: "/challengeAttempt",
    componentName: "ChallengeAttempt",
  },
  challengeAttemptReview: {
    routeKey: "challengeAttemptReview",
    routeTitle: "Attempt Review",
    backRouteKey: "|previousPage|",
    path: [
      "/challengeAttemptReview/:attemptID",
      "/challengeAttemptReview/:challengeID/:attemptIndex"
    ],
    componentName: "ChallengeAttemptReview",
  },
  accountLoginAnonymous: {
    routeKey: "accountLoginAnonymous",
    routeTitle: "Login Anonymously",
    backRouteKey: null,
    path: "/accountLoginAnonymous",
    componentName: "AccountLoginAnonymous",
  },
  accountLoginSelect: {
    routeKey: "accountLoginSelect",
    routeTitle: "Select Login Type",
    backRouteKey: null,
    path: "/login",
    componentName: "AccountLoginSelect",
  },
  accountLoginStandard: {
    routeKey: "accountLoginStandard",
    routeTitle: "Standard Login",
    backRouteKey: null,
    path: "/accountLoginStandard",
    componentName: "AccountLoginStandard",
  },
  accountCreate: {
    routeKey: "accountCreate",
    routeTitle: "Create Account",
    backRouteKey: null,
    path: "/accountCreate",
    componentName: "AccountCreate",
  },
  accountEdit: {
    routeKey: "accountEdit",
    routeTitle: "Edit Account",
    backRouteKey: "account",
    path: "/accountEdit",
    componentName: "AccountEdit",
  },
  accountConvertAnonymous: {
    routeKey: "accountConvertAnonymous",
    routeTitle: "Register Account",
    backRouteKey: "account",
    path: "/accountConvertAnonymous",
    componentName: "AccountConvertAnonymous",
  },
  account: {
    routeKey: "account",
    routeTitle: "Account",
    backRouteKey: "home",
    path: "/account",
    componentName: "Account",
  },
  friends: {
    routeKey: "friends",
    routeTitle: "Friends",
    backRouteKey: "home",
    path: "/friends",
    componentName: "Friends",
  },
  friend: {
    routeKey: "friend",
    routeTitle: "Friend",
    backRouteKey: "friends",
    path: "/friend/:friendID",
    componentName: "Friend",
  },
  friendArchive: {
    routeKey: "friendArchive",
    routeTitle: "Friend Archive",
    backRouteKey: "friend",
    path: "/friend/:friendID/archive",
    componentName: "FriendArchive",
  },
};

export const routesArray = Object.keys(routes).map((routeName) => {
  return routes[routeName];
});

export default routes;
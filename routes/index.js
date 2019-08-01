import Account from "./Account";
import AccountCreate from "./AccountCreate";
import AccountEdit from "./AccountEdit";
import AccountLoginAnonymous from "./AccountLoginAnonymous";
import AccountLoginSelect from "./AccountLoginSelect";
import AccountLoginStandard from "./AccountLoginStandard";
import AccountRegister from "./AccountRegister";
import Friends from "./Friends";
import Friend from "./Friend";
import FriendArchive from "./FriendArchive";
import Game from "./Game";
import GameArchive from "./GameArchive";
import GameReview from './GameReview';
import Games from "./Games";
import Challenges from "./Challenges";
import Challenge from "./Challenge";
import ChallengeAttempt from "./ChallengeAttempt";
import ChallengeAttemptReview from "./ChallengeAttemptReview";

export const RouteComponents = {
  Account,
  AccountCreate,
  AccountEdit,
  AccountLoginAnonymous,
  AccountLoginSelect,
  AccountLoginStandard,
  AccountRegister,
  Friends,
  Friend,
  FriendArchive,
  Game,
  GameArchive,
  GameReview,
  Games,
  Challenges,
  Challenge,
  ChallengeAttempt,
  ChallengeAttemptReview,
};

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
    routeTitle: "AccountLoginAnonymous",
    backRouteKey: null,
    path: "/accountLoginAnonymous",
    componentName: "AccountLoginAnonymous",
  },
  accountLoginSelect: {
    routeKey: "accountLoginSelect",
    routeTitle: "AccountLoginSelect",
    backRouteKey: null,
    path: "/login",
    componentName: "AccountLoginSelect",
  },
  accountLoginStandard: {
    routeKey: "accountLoginStandard",
    routeTitle: "AccountLoginStandard",
    backRouteKey: null,
    path: "/accountLoginStandard",
    componentName: "AccountLoginStandard",
  },
  accountCreate: {
    routeKey: "accountCreate",
    routeTitle: "AccountCreate",
    backRouteKey: null,
    path: "/accountCreate",
    componentName: "AccountCreate",
  },
  accountEdit: {
    routeKey: "accountEdit",
    routeTitle: "AccountEdit",
    backRouteKey: null,
    path: "/accountEdit",
    componentName: "AccountEdit",
  },
  accountRegister: {
    routeKey: "accountRegister",
    routeTitle: "AccountRegister",
    backRouteKey: null,
    path: "/accountRegister",
    componentName: "AccountRegister",
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
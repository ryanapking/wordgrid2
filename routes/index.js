import Home from "./Home";
import Login from "./Login";
import Account from "./Account";
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
  Home,
  Login,
  Account,
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
  login: {
    routeKey: "login",
    routeTitle: "Login",
    backRouteKey: null,
    path: "/login",
    componentName: "Login",
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
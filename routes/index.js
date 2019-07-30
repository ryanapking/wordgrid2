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
    routeTitle: "Games",
    backRoute: null,
    path: "/",
    componentName: "Games",
  },
  game: {
    routeTitle: "vs ${opponentName}",
    backRoute: "home",
    path: "/game/:gameID",
    componentName: "Game",
  },
  gameReview: {
    routeTitle: "vs ${opponentName} Review",
    backRoute: "${prevHistory}",
    path: "/gameReview/:gameID",
    componentName: "GameReview",
  },
  challenges: {
    routeTitle: "Challenges",
    backRoute: "home",
    path: "/challenges",
    componentName: "Challenges",
  },
  challenge: {
    routeTitle: "${challengeDate} Challenge",
    backRoute: "challenges",
    path: "/challenge/:challengeID",
    componentName: "Challenge",
  },
  challengeAttempt: {
    routeTitle: "${challengeDate} Challenge Attempt",
    backRoute: "${prevHistory}",
    path: "/challengeAttempt",
    componentName: "ChallengeAttempt",
  },
  challengeAttemptReview: {
    routeTitle: "Complex Title",
    backRoute: "${prevHistory}",
    path: [
      "/challengeAttemptReview/:attemptID",
      "/challengeAttemptReview/:challengeID/:attemptIndex"
    ],
    componentName: "ChallengeAttemptReview",
  },
  login: {
    routeTitle: "Login",
    backRoute: null,
    path: "/login",
    componentName: "Login",
  },
  account: {
    routeTitle: "Account",
    backRoute: "home",
    path: "/account",
    componentName: "Account",
  },
  friends: {
    routeTitle: "Friends",
    backRoute: "home",
    path: "/friends",
    componentName: "Friends",
  },
  friend: {
    routeTitle: "${friendName}",
    backRoute: "friends",
    path: "/friend/:friendID",
    componentName: "Friend",
  },
  friendArchive: {
    routeTitle: "${friendName} Archive",
    backRoute: "friend",
    path: "/friend/:friendID/archive",
    componentName: "FriendArchive",
  },
};

export const routesArray = Object.keys(routes).map((routeName) => {
  return routes[routeName];
});

export default routes;
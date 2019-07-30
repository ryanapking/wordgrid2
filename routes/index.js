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
    paths: ["/"],
    componentName: "Games",
  },
  game: {
    routeTitle: "vs ${opponentName}",
    backRoute: "home",
    paths: ["/game/:gameID"],
    componentName: "Game",
  },
  gameReview: {
    routeTitle: "vs ${opponentName} Review",
    backRoute: "${prevHistory}",
    paths: ["/gameReview/:gameID"],
    componentName: "GameReview",
  },
  challenges: {
    routeTitle: "Challenges",
    backRoute: "home",
    paths: ["/challenges"],
    componentName: "Challenges",
  },
  challenge: {
    routeTitle: "${challengeDate} Challenge",
    backRoute: "challenges",
    paths: ["/challenge/:challengeID"],
    componentName: "Challenge",
  },
  challengeAttempt: {
    routeTitle: "${challengeDate} Challenge Attempt",
    backRoute: "${prevHistory}",
    paths: ["/challengeAttempt"],
    componentName: "ChallengeAttempt",
  },
  challengeAttemptReview: {
    routeTitle: "Complex Title",
    backRoute: "${prevHistory}",
    paths: [
      "/challengeAttemptReview/:attemptID",
      "/challengeAttemptReview/:challengeID/:attemptIndex"
    ],
    componentName: "ChallengeAttemptReview",
  },
  login: {
    routeTitle: "Login",
    backRoute: null,
    paths: ["/login"],
    componentName: "Login",
  },
  account: {
    routeTitle: "Account",
    backRoute: "home",
    paths: ["/account"],
    componentName: "Account",
  },
  friends: {
    routeTitle: "Friends",
    backRoute: "home",
    paths: ["/friends"],
    componentName: "Friends",
  },
  friend: {
    routeTitle: "${friendName}",
    backRoute: "friends",
    paths: ["/friend/:friendID"],
    componentName: "Friend",
  },
  friendArchive: {
    routeTitle: "${friendName} Archive",
    backRoute: "friend",
    paths: ["/friend/:friendID/archive"],
    componentName: "FriendArchive",
  },
};

// Each route above can have more than one path.
// Dump all paths into an array to easily output each as a <Route> in App.js
let allPaths = [];
Object.keys(routes).forEach((routeName) => {
  const route = routes[routeName];
  route.paths.forEach((path) => {
    allPaths.push({
      componentName: route.componentName,
      path,
    });
  });
});

export const pathsArray = allPaths;

export default routes;
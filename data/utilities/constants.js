// used for styling tile spaces in the RN application
export const SPACE_STATES = {
  SPACE_EMPTY: 0,
  SPACE_FILLED: 1,
  SPACE_CONSUMED: 2,
  SPACE_FILLED_HOVERED: 3,
  SPACE_EMPTY_HOVERED: 4,
};

// Status strings are stored in the DB. Do not change.
export const GAME_STATES = {
  NEW: "new", // set upon creation, will never be set to this on game save. Game has no player2.
  REQUEST_PENDING_NEW: "rp-new", // game was initialized with a specific opponent, waiting for requester to make first move
  REQUEST_PENDING: "rp", // game was initialized with a specific opponent, waiting for confirmation from opponent
  WAITING: "waiting", // after initial move, before a second player has joined
  IN_PROGRESS: "in progress", // game is in progress
  ABANDONED: "abandoned", // may never exist. possible status for job that will review games.
  ENDED: "ended", // game has ended naturally
  FORFEIT: "forfeit", // game was forfeit
};


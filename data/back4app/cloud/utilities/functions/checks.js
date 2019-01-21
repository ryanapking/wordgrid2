const config = require('../config');
const settings = config.settings;

function validateMove(originalGameObject, move) {
  console.log('validateMove()');
  console.log('original game object:', originalGameObject);
  console.log('move:', move);
}

function validateWordPath(wordPath, boardState) {
  // wordPath.split("|").forEach( ())
}

function validatePiecePlacement(pieces, placementRef, boardState) {

}

function checkPieceFit(playerPieces, boardState) {
  // checks a player's pieces to see if any of them will fit on the board
  // loops until a piece that fits is found
  let spaceCheck = false;

  const rowStart = -3;
  const columnStart = -3;
  const rowEnd = 13;
  const columnEnd = 13;

  playerPieces.forEach( (piece, pieceIndex) => {
    for (let row = rowStart; row < rowEnd; row++) {
      for (let column = columnStart; column < columnEnd; column++) {

        let collision = false;

        piece.forEach( (pieceRow, pieceRowIndex) => {
          pieceRow.forEach( (letter, pieceColumnIndex) => {
            if (letter) {
              const checkBoardRow = row + pieceRowIndex;
              const checkBoardColumn = column + pieceColumnIndex;
              if (
                checkBoardRow < 0
                || checkBoardRow >= settings.boardHeight
                || checkBoardColumn < 0
                || checkBoardColumn >= settings.boardWidth
                || boardState[checkBoardRow][checkBoardColumn]
              ) {
                collision = true;
              }
            }
          });
        });

        if (!collision) {
          console.log(`piece ${pieceIndex} fits in row: ${row}, col: ${column}`);
          spaceCheck = true;
        }

      }
    }
  });

  return spaceCheck;
}

function gameOverCheck(game) {
  const turns = turnCounter(game);
  const scores = scoreTabulator(game);

  const turnsReached = (turns.p2 >= settings.naturalTurns && turns.p1 === turns.p2);
  const gameTied = (scores.p1 === scores.p2);

  const gameOver = (turnsReached && !gameTied);
  console.log('game over?', gameOver);

  return gameOver;
}

function turnCounter(game) {
  return game.history.reduce( (turnCount, move) => {
    if (move.p === game.p1) {
      return {...turnCount, p1: turnCount.p1 + 1};
    } else if (move.p === game.p2) {
      return {...turnCount, p2: turnCount.p2 + 1};
    } else {
      return turnCount;
    }
  }, {p1: 0, p2: 0});
}

function scoreTabulator(game) {
  return game.history.reduce( (scoreTab, move) => {
    if (move.p === game.p1) {
      return {...scoreTab, p1: scoreTab.p1 + move.wv};
    } else if (move.p === game.p2) {
      return {...scoreTab, p2: scoreTab.p2 + move.wv};
    } else {
      return scoreTab;
    }
  }, {p1: 0, p2: 0});
}

function getWinner(game) {
  const gameOver = gameOverCheck(game);
  if (!gameOver) return null;

  const scores = scoreTabulator(game);
  if (scores.p1 > scores.p2) {
    return "p1";
  } else {
    return "p2";
  }
}

module.exports = {
  checkPieceFit,
  gameOverCheck,
  scoreTabulator,
  getWinner,
  validateMove,
};
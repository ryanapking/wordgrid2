import Parse from "./client-setup";

export async function startGame() {
  let newGame = await Parse.Cloud.run("startGame")
    .catch( (err) => {
      throw new Error(err);
    });

  return newGame;
}

export async function saveMove(gameID, move) {
  let savedMove = await Parse.Cloud.run("saveMove", {gameID, move})
    .catch( (err) => {
      throw new Error(err);
    });

  console.log('saved move:', savedMove);

  return savedMove;
}
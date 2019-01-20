import Parse from "./client-setup";

export async function startGame() {
  let newGame = await Parse.Cloud.run("startGame")
    .catch( (err) => {
      throw new Error(err);
    });

  return newGame;
}
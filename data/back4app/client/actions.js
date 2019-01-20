import Parse from "./client-setup";

export async function startGame() {
  let someValue = await Parse.Cloud.run("startGame")
    .then( (response) => {
      console.log('startGame success:', response);
    })
    .catch( (err) => {
      console.log('startGame error:', err);
    });

  console.log('some value:', someValue);
}
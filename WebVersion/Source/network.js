

class Network {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;
    this.high_scores_last_loaded = 0;
  }


  anonymousSignIn(callback) {
    console.log("Using anonymous sign in for high scores");
    var self = this;
    firebase.auth().signInAnonymously()
      .then(() => {
        callback();
      })
      .catch((error) => {
        console.log("Error with anonymous sign in!")
        console.log(error);
      });

  }


  loadHighScores(callback = null) {
    var self = this;
    console.log("Loading high scores");

    if (Date.now() - this.high_scores_last_loaded < 60000) {
      console.log("Skipping because high scores were successfully loaded within the last minute");
      return;
    }
    
    this.game.high_scores = {};

    this.database.ref("/high_scores").orderByChild("score").limitToLast(10).once("value").then((result) => {
      if (result.exists()) {
        self.game.high_scores = Object.values(result.val());
        self.game.high_scores.sort((a,b) => (a.score < b.score) ? 1 : -1);
        self.high_scores_last_loaded = Date.now();

        if (callback != null) {
          callback();
        }
      } else {
        console.log("Could not look up high scores");
      }
    }).catch((error) => {
      console.log("Error looking up high scores");
      console.log(error);
    });;
  }


  addHighScore(name, score, callback, error_callback = null) {
    var self = this;

    let r = firebase.database().ref("high_scores").push();
    r.set({name: name, score: score}, (error) =>{
      if (error) {
        console.log("Failed to save high score to the cloud.");
        console.log(error);
        if (error_callback != null) {
          error_callback();
        }
      } else {
        console.log("Saved high score to the cloud.");
        callback();
      }
    });
  }
}
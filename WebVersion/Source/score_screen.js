
//
// Score screen shows high scores.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class ScoreScreen extends PIXI.Container {

  constructor() {
    super();
    this.initializeScreen();
  };


  initializeScreen() {

  }

  startScreen() {
    let self = this;

    this.score_name = [];
    this.score_name_cursor = 0;

    setMusic("lobby_music");

    console.log(game.last_score);
    let score_text = "" + game.last_score + " POINTS";
    console.log(score_text);
    let score_textbox = new PIXI.Text(score_text, {fontFamily: default_font, fontSize: 80, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    score_textbox.anchor.set(0.5,0.5);
    score_textbox.position.set(game.width / 2, 300);
    this.addChild(score_textbox);


    for (var i = 0; i < 6; i++) {
        var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
        cursor.width = 70 - 3;
        cursor.height = 2;
        cursor.anchor.set(0, 0.5);
        cursor.position.set(game.width / 2 + 70 * (i - 3), game.height * 8/16);
        cursor.tint = 0xFFFFFF;
        this.addChild(cursor);

        let letter = new PIXI.Text("", {fontFamily: default_font, fontSize: 80, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
        letter.anchor.set(0.5, 0.5);
        letter.position.set(game.width / 2 + 70 * (i - 3) + 35, game.height * 8/16 - 40);
        this.addChild(letter);
        this.score_name.push(letter);
      }
  };


  addLetter(letter) {
    if (this.score_name_cursor <= 5) {
        this.score_name[this.score_name_cursor].text = letter;
        this.score_name_cursor += 1;
    }
  }

  deleteLetter() {
    if (this.score_name_cursor > 0) {
        this.score_name_cursor -= 1;
        this.score_name[this.score_name_cursor].text = "";
      }
  }


  addScoreAndReturnToTitle() {
    let self = this;

    let name = "";
    for (var i = 0; i < 6; i++) {
      name += this.score_name[i].text.toUpperCase();
    }

    game.network.addHighScore(name, game.last_score, function(){})

    delay(function() {
        game.screens["title"].initializeScreen();
        game.switchScreens("score", "title", 1, 0);
    }, 1000);
  }


  handleKeyDown(key) {
    for (i in lower_array) {
        if (key.toLowerCase() === lower_array[i]) {
          this.addLetter(key.toLowerCase());
        }
    }

    if (key === "Backspace" || key === "Delete") {
        this.deleteLetter();
    }

    if (key === "Enter") {
        this.addScoreAndReturnToTitle();
    }
  }


  update() {
    // if (this.follow_character == null) return;
    // if (this.mode != "walk") return;

    // let character = this.follow_character;
    // let keymap = game.keymap;

    // if (keymap["ArrowUp"] && keymap["ArrowRight"]) {
    //   character.direction = "upright";
    // } else if (keymap["ArrowUp"] && keymap["ArrowLeft"]) {
    //   character.direction = "upleft";
    // } else if (keymap["ArrowDown"] && keymap["ArrowRight"]) {
    //   character.direction = "downright";
    // } else if (keymap["ArrowDown"] && keymap["ArrowLeft"]) {
    //   character.direction = "downleft";
    // } else if (keymap["ArrowDown"]) {
    //   character.direction = "down";
    // } else if (keymap["ArrowUp"]) {
    //   character.direction = "up";
    // } else if (keymap["ArrowLeft"]) {
    //   character.direction = "left";
    // } else if (keymap["ArrowRight"]) {
    //   character.direction = "right";
    // } else {
    //   character.direction = null;
    // }

    // if (character.direction != null) {
    //   this.testAndMove(character);
    // }
    
  };
};

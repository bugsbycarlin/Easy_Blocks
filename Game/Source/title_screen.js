
//
// 
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class TitleScreen extends PIXI.Container {


  constructor() {
    super();
    this.initializeScreen();
  };


  initializeScreen() {
    let self = this;

    this.background = makeSprite("Art/title_board.png");
    this.background.width = 1440;
    this.background.height = 900;
    this.background.anchor.set(0,0);
    this.background.position.set(0,0);
    this.addChild(this.background);

    this.play_mat = makeContainer(this.background);

    this.ticker = 1;
    this.step = 1;
    this.start_time = game.markTime();

    this.drops = [];

    this.texture = PIXI.RenderTexture.create({width: game.width, height: game.height});
    this.maskContainer = makeContainer();
    this.letters = [];
    this.letters_2 = [];
    let text = "EASY BLOCKS";
    for (var i = 0; i < text.length; i++) {
      let letter = new PIXI.Text(text.charAt(i), {fontFamily: default_font, fontSize: 200, fill: 0xFFFFFF, letterSpacing: 8, align: "center"});
      letter.position.set(260 + 90 * i, 120);
      this.maskContainer.addChild(letter);
      this.letters.push(letter);
      letter.speed = 1 + 0.2 * Math.random();
    }

    text = "PRESS ENTER";
    for (var i = 0; i < text.length; i++) {
      let letter = new PIXI.Text(text.charAt(i), {fontFamily: default_font, fontSize: 80, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
      letter.position.set(440 + 50 * i, 690);
      this.maskContainer.addChild(letter);
      this.letters_2.push(letter);
      letter.speed = 1 + 0.2 * Math.random();
    }

    let maskSprite = new PIXI.Sprite(this.prepareTexture());
    this.background.addChild(maskSprite);

    this.background.filters = [
      new PIXI.SpriteMaskFilter(maskSprite)
    ];

    let credits = new PIXI.Text("Art, Programming: Matt Carlin\nMusic: fesliyanstudios.com", 
      {fontFamily: default_font, fontSize: 20, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
    credits.position.set(game.width / 2, game.height - 40);
    credits.anchor.set(0.5, 0.5);
    this.maskContainer.addChild(credits);


    this.status = "fixed";

    setMusic("lobby_music");

    let mu = firebase.auth().currentUser;
    if (mu != null && mu.uid != null) {
      game.auth_user = mu;
      game.network.uid = mu.uid;
      game.network.loadHighScores(function() {
          let hs_text = "High Scores\n";
          for (const [key, value] of Object.entries(game.high_scores)) {
            hs_text += value.name + ": " + value.score + "\n";
          }
          let hs_textbox = new PIXI.Text(hs_text, 
            {fontFamily: default_font, fontSize: 25, fill: 0xFFFFFF, letterSpacing: 5, align: "left"});
          hs_textbox.position.set(game.width / 2 - 100, game.height - 520);
          hs_textbox.anchor.set(0, 0);
          self.maskContainer.addChild(hs_textbox);
        });
    }
    if (game.network.uid == null) {
      game.network.anonymousSignIn(function() {
        game.network.loadHighScores(function() {
          let hs_text = "High Scores\n";
          for (const [key, value] of Object.entries(game.high_scores)) {
            hs_text += value.name + ": " + value.score + "\n";
          }
          let hs_textbox = new PIXI.Text(hs_text, 
            {fontFamily: default_font, fontSize: 25, fill: 0xFFFFFF, letterSpacing: 5, align: "left"});
          hs_textbox.position.set(game.width / 2 - 100, game.height - 520);
          hs_textbox.anchor.set(0, 0);
          self.maskContainer.addChild(hs_textbox);
        });
      });
    }
  }



  addDrop(x, y) {
    let self = this;

    let color = pick(block_colors)
    let drop = {};

    drop.list = [];

    let matrix = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ]

    if (dice(100) < 50) matrix[0][1] = 1;
    if (dice(100) < 50) matrix[2][1] = 1;
    if (dice(100) < 50) matrix[1][0] = 1;
    if (dice(100) < 50) matrix[1][2] = 1;

    if ((matrix[0][1] == 1 || matrix[1][0] == 1) && dice(100) < 40) matrix[0][0] = 1;
    if ((matrix[0][1] == 1 || matrix[1][2] == 1) && dice(100) < 40) matrix[0][2] = 1;
    if ((matrix[1][2] == 1 || matrix[2][1] == 1) && dice(100) < 40) matrix[2][2] = 1;
    if ((matrix[1][0] == 1 || matrix[2][1] == 1) && dice(100) < 40) matrix[2][0] = 1;

    drop.c_x = x;
    drop.c_y = y;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (matrix[i][j] == 1) {
                let block = makeSprite("Art/block.png");
                block.tint = color;
                block.anchor.set(0, 0);
                block.clear_step = 0;
                block.state = "normal";
                this.setPosition(block, x + i - 1, y + j - 1);
                drop.list.push(block);
                this.play_mat.addChild(block);
            }
        }
    }

    return drop;
  }


  setPosition(block, x, y) {
    block.position.set(360 + 36 * x, 18 + 36 * (24 - y));
    block.c_x = x;
    block.c_y = y;
  }


  dropDrop(drop) {

    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        this.setPosition(block, block.c_x, block.c_y - 1);
    }

    drop.c_y -= 1;
  }


  prepareTexture() {
    game.renderer.render(this.maskContainer, this.texture);
    return this.texture;
  }


  handleKeyDown(key) {
    if (this.status === "fixed" && key === "Enter") {
      stopMusic();
      soundEffect("clear");
      this.status = "transitioning";
      game.screens["game"].initializeScreen();
      game.switchScreens("title", "game", 1, 0, function(){game.screens["game"].startPlay()});
    }
  }

 
  update() {
    this.ticker += 1;

    for (let i = 0; i < this.letters.length; i++) {
      this.letters[i].y = 120 + 40 * Math.sin(this.ticker / 40 * this.letters[i].speed);
    }
    // for (let i = 0; i < this.letters_2.length; i++) {
    //   this.letters_2[i].y = 690 + 25 * Math.sin(this.ticker / 40 * this.letters_2[i].speed);
    // }

    this.last_texture = this.prepareTexture();
    this.maskSprite = new PIXI.Sprite(this.last_texture);

    this.background.filters = [
      new PIXI.SpriteMaskFilter(this.maskSprite)
    ];

    if (game.timeSince(this.start_time) > 375 * this.step) {
        this.step += 1;

        if (dice(100) < 25) {
          this.drops.push(this.addDrop(dice(19), 26));
        }

        for (let i = 0; i < this.drops.length; i++) {
          this.dropDrop(this.drops[i]);
        }

        let new_drops = [];
        for (let i = 0; i < this.drops.length; i++) {
          let drop = this.drops[i];
          if (drop.c_y <= 0) {
            for (let k = 0; k < drop.list.length; k++) {
              this.play_mat.removeChild(drop.list[k]);
            }
          } else {
            new_drops.push(drop);
          }
        }
        this.drops = new_drops;
    }

    
  }
};




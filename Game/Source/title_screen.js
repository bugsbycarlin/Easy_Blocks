
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
    this.title_text = new PIXI.Text("EASY BLOCKS", {fontFamily: default_font, fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "center"});
    this.title_text.anchor.set(0.5,0.5);
    this.title_text.position.set(game.width / 2, game.height / 2 - 150);
    this.addChild(this.title_text);

    this.title_text = new PIXI.Text("Press Enter", {fontFamily: default_font, fontSize: 70, fill: 0xFFFFFF, letterSpacing: 8, align: "center"});
    this.title_text.anchor.set(0.5,0.5);
    this.title_text.position.set(game.width / 2, game.height / 2 + 200);
    this.addChild(this.title_text);

    this.status = "fixed";
  }


  handleKeyDown(key) {
    if (this.status === "fixed" && key === "Enter") {
      this.status = "transitioning";
      game.screens["game"].initializeScreen();
      game.switchScreens("title", "game", 1, 0, function(){game.screens["game"].startPlay()});
    }
  }

 
  update() {
    
  }
};




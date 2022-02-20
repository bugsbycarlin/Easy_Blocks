
//
// This is a collection of user interface helper methods.
// This is where we store things like popup window makers, special effect makers,
// scene transition machinery, and so forth.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


//
//
// Special Effect tools
//
//


Game.prototype.addShake = function(thing) {
  thing.shake = this.markTime();
  this.shakers.push(thing);
}

// Put this in game update to shake anything that you've put in the shakers list.
// Shake something by setting thing.shake = game.getTime();
Game.prototype.shakeThings = function() {
  var self = this;

  let new_shakers = [];
  for (let item of this.shakers) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y);
        item.permanent_x = null;
        item.permanent_y = null;
      } else {
        new_shakers.push(item);
      }
    }
  }
  this.shakers = new_shakers;
}


// Put this in game update to drop things off the screen.
Game.prototype.freeeeeFreeeeeFalling = function(fractional) {
  var self = this;
  fractional = 0.5;
  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    if (item.gravity != null) {
      item.vy += item.gravity * fractional;
    } else {
      item.vy += this.gravity * fractional;
    }
    
    if (item.floor != null && item.position.y > item.floor) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  let new_freefalling = [];
  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;
}


// Make a smoke effect. Requires pre-loading the smoke sprite.
function makeSmoke(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/smoke.json"].spritesheet;
  let smoke_sprite = new PIXI.AnimatedSprite(sheet.animations["smoke"]);
  smoke_sprite.anchor.set(0.5,0.5);
  smoke_sprite.position.set(x, y);
  // smoke_sprite.angle = Math.random() * 360;
  parent.addChild(smoke_sprite);
  smoke_sprite.animationSpeed = 0.4; 
  smoke_sprite.scale.set(xScale, yScale);

  // smoke_sprite.onLoop = function() {
  //   this.angle = Math.random() * 360;
  // }
  // console.log("But abba tho");
  parent.addChild(smoke_sprite);
  smoke_sprite.loop = false;
  smoke_sprite.onComplete = function() {
    smoke_sprite.state = "dead";
    parent.removeChild(smoke_sprite);
  }
  smoke_sprite.play();
  return smoke_sprite;
}


// Make a puff effect. Requires pre-loading the puff sprite.
function makePuff(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/puff.json"].spritesheet;
  let puff_sprite = new PIXI.AnimatedSprite(sheet.animations["puff"]);
  puff_sprite.anchor.set(0.5,0.5);
  puff_sprite.position.set(x, y);
  parent.addChild(puff_sprite);
  puff_sprite.animationSpeed = 0.17; 
  puff_sprite.scale.set(xScale, yScale);
  parent.addChild(puff_sprite);
  puff_sprite.loop = false;
  puff_sprite.gotoAndStop(1);
  puff_sprite.onComplete = function() {
    puff_sprite.status = "dead";
    parent.removeChild(puff_sprite);
  }
  puff_sprite.play();
  return puff_sprite;
}


// Make a steam effect. Requires pre-loading the steam sprite.
function makeSteam(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/steam.json"].spritesheet;
  let steam_sprite = new PIXI.AnimatedSprite(sheet.animations["steam"]);
  steam_sprite.anchor.set(0.5,0.5);
  steam_sprite.position.set(x, y);
  parent.addChild(steam_sprite);
  steam_sprite.animationSpeed = 0.25; 
  steam_sprite.scale.set(xScale, yScale);
  parent.addChild(steam_sprite);
  steam_sprite.loop = false;
  steam_sprite.onComplete = function() {
    steam_sprite.status = "dead";
    parent.removeChild(steam_sprite);
  }
  steam_sprite.play();
  return steam_sprite;
}


// Make a pop effect. Requires pre-loading the pop sprite.
function makePop(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/pop.json"].spritesheet;
  let pop_sprite = new PIXI.AnimatedSprite(sheet.animations["pop"]);
  pop_sprite.anchor.set(0.5,0.5);
  pop_sprite.position.set(x, y);
  parent.addChild(pop_sprite);
  pop_sprite.animationSpeed = 0.4;
  pop_sprite.scale.set(xScale, yScale);

  parent.addChild(pop_sprite);
  pop_sprite.loop = false;
  pop_sprite.onComplete = function() {
    parent.removeChild(pop_sprite);
  }
  pop_sprite.play();
  return pop_sprite;
}


// Make an explosion effect. Requires pre-loading the explosion sprite.
function makeExplosion(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/explosion.json"].spritesheet;
  let explosion_sprite = new PIXI.AnimatedSprite(sheet.animations["explosion"]);
  explosion_sprite.anchor.set(0.5,0.5);
  explosion_sprite.position.set(x, y);
  parent.addChild(explosion_sprite);
  explosion_sprite.animationSpeed = 0.4; 
  explosion_sprite.scale.set(xScale, yScale);

  parent.addChild(explosion_sprite);
  explosion_sprite.loop = false;
  explosion_sprite.onComplete = function() {
    explosion_sprite.state = "dead";
    parent.removeChild(explosion_sprite);
  }
  explosion_sprite.play();
  return explosion_sprite;
}


// Make a blast energy effect. Requires pre-loading the blast energy sprite.
function makeBlastEnergy(parent, tint, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/blast_energy.json"].spritesheet;
  let blast_energy_sprite = new PIXI.AnimatedSprite(sheet.animations["blast_energy"]);
  blast_energy_sprite.anchor.set(0.5,0.5);
  blast_energy_sprite.position.set(x, y);
  blast_energy_sprite.tint = tint;
  parent.addChild(blast_energy_sprite);
  blast_energy_sprite.animationSpeed = 1; 
  blast_energy_sprite.scale.set(xScale, yScale);

  parent.addChild(blast_energy_sprite);
  blast_energy_sprite.loop = false;
  blast_energy_sprite.onComplete = function() {
    blast_energy_sprite.state = "dead";
    parent.removeChild(blast_energy_sprite);
  }
  blast_energy_sprite.play();
  return blast_energy_sprite;
}


//
//
// Meta UI tools
//
//

Game.prototype.initializeScreens = function() {
  var self = this;
  this.screens = [];

  this.addScreen("game", new GameScreen());
  this.addScreen("score", new ScoreScreen());
  this.addScreen("title", new TitleScreen());

  this.black = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.black.width = this.width;
  this.black.height = this.height;
  this.black.tint = 0x000000;

  this.screens[first_screen].position.x = 0;
  this.current_screen = this.screens[first_screen];
}


Game.prototype.addScreen = function(name, screen) {
  this.screens[name] = screen;
  this.screens[name].name = name;
  this.screens[name].position.x = this.width;
  pixi.stage.addChild(this.screens[name]);
}


Game.prototype.popScreens = function(old_screen, new_screen) {
  var self = this;
  console.log("switching from " + old_screen + " to " + new_screen);
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[old_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  this.screens[old_screen].position.x = game.width;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i].name == new_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
    }
  }
  this.current_screen = this.screens[new_screen];
}


Game.prototype.clearScreen = function(screen) {
  console.log("clearing " + screen.name)
  while(screen.children[0]) {
    let x = screen.removeChild(screen.children[0]);
    x.destroy();
  }
}


Game.prototype.fadeToBlack = function(time_to_fade) {
  pixi.stage.addChild(this.black);
  this.black.alpha = 0.01;
  var tween = new TWEEN.Tween(this.black)
    .to({alpha: 1})
    .duration(time_to_fade)
    .onComplete(function() {
    })
    .start();
}


Game.prototype.fadeFromBlack = function(time_to_fade) {
  var tween = new TWEEN.Tween(this.black)
    .to({alpha: 0})
    .duration(time_to_fade)
    .onComplete(function() {
      pixi.stage.removeChild(this.black);
    })
    .start();
}


Game.prototype.switchScreens = function(old_screen, new_screen, x_dir, y_dir, action=null) {
  var self = this;

  this.screens[new_screen].position.set(x_dir * this.width, y_dir * this.height);
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
    }
  }
  var tween_1 = new TWEEN.Tween(this.screens[old_screen].position)
    .to({x: -1 * x_dir * this.width, y: -1 * y_dir * this.height})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {self.clearScreen(self.screens[old_screen]);})
    .start();
  var tween_2 = new TWEEN.Tween(this.screens[new_screen].position)
    .to({x: 0, y: 0})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {if (action != null) {action()}})
    .start();
  this.current_screen = this.screens[new_screen];
}





///-------
///
///
// Game.prototype.switchScreens = function(old_screen, new_screen) {
//   var self = this;

//   var direction = -1;
//   if (new_screen == "title") direction = 1;
//   this.screens[new_screen].position.x = direction * -1 * this.width;
//   for (var i = 0; i < this.screens.length; i++) {
//     if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
//       this.screens[i].visible = true;
//     } else {
//       this.screens[i].visible = false;
//       this.clearScreen(this.screens[i]);
//     }
//   }
//   var tween_1 = new TWEEN.Tween(this.screens[old_screen].position)
//     .to({x: direction * this.width})
//     .duration(1000)
//     .easing(TWEEN.Easing.Cubic.InOut)
//     .onComplete(function() {self.clearScreen(self.screens[old_screen]);})
//     .start();
//   var tween_2 = new TWEEN.Tween(this.screens[new_screen].position)
//     .to({x: 0})
//     .duration(1000)
//     .easing(TWEEN.Easing.Cubic.InOut)
//     .start();
//   this.current_screen = new_screen;
// }


Game.prototype.makeLoadingScreen = function() {
  this.black.alpha = 1;
  this.black.visible = true;
  pixi.stage.addChild(this.black);

  this.loading_text = new PIXI.Text("LOADING...", {fontFamily: default_font, fontSize: 72, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.loading_text.anchor.set(0.5,0.5);
  this.loading_text.position.set(this.width / 2, this.height / 2);
  pixi.stage.addChild(this.loading_text);
}


// Game.prototype.fadeToBlack = function(time_to_fade) {
//   pixi.stage.addChild(this.black);
//   this.black.alpha = 0.01;
//   var tween = new TWEEN.Tween(this.black)
//     .to({alpha: 1})
//     .duration(time_to_fade)
//     .onComplete(function() {
//     })
//     .start();
// }


// Game.prototype.fadeFromBlack = function(time_to_fade) {
//   var tween = new TWEEN.Tween(this.black)
//     .to({alpha: 0})
//     .duration(time_to_fade)
//     .onComplete(function() {
//       pixi.stage.removeChild(this.black);
//     })
//     .start();
// }


Game.prototype.fadeScreens = function(old_screen, new_screen, double_fade = false) {
  var self = this;
  console.log("switching from " + old_screen + " to " + new_screen);
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  if (double_fade) {  
    pixi.stage.addChild(this.black);
    this.black.alpha = 1;
  }
  pixi.stage.addChild(this.screens[old_screen]);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
      this.screens[i].alpha = 1;
    } else {
      this.screens[i].visible = false;
      // this.clearScreen(this.screens[i]);
    }
  }

  var tween = new TWEEN.Tween(this.screens[old_screen])
    .to({alpha: 0})
    .duration(1000)
    // .easing(TWEEN.Easing.Linear)
    .onComplete(function() {
      self.screens[new_screen].alpha = 1;
      self.screens[new_screen].visible = true;
      if (!double_fade) {
        self.clearScreen(self.screens[old_screen]);
      } else {
        var tween2 = new TWEEN.Tween(self.black)
        .to({alpha: 0})
        .duration(1000)
        .onComplete(function() {
          // self.clearScreen(self.screens[old_screen]);
          self.screens[old_screen].position.x = 1290;
          self.screens[old_screen].alpha = 1;
          self.screens[old_screen].visible = false;
          self.current_screen = new_screen;
          pixi.stage.removeChild(self.black);
        })
        .start();
      }
    })
    .start();
  
}






//
// Game screen runs the actual game.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let max_drop_size = 10;

let block_colors = [
  0xffda44,
  0x57a4ff,
  0xf7afd1,
  0xb2fa0d,
]

let tile_types = [
    "left",
    "right",
    "up",
    "down",
    "warp",
    "swap",
    "darkness",
    "disintegrate",
]

let finished_block_color = 0x50206c;

class GameScreen extends PIXI.Container {

  constructor() {
    super();
    this.initializeScreen();
  }


  initializeScreen() {
    this.background = makeSprite("Art/board.png");
    this.background.anchor.set(0,0);
    this.background.position.set(0,0);
    this.addChild(this.background);


    this.play_mat = makeContainer(this);
    
    this.crossbar = makeSprite("Art/crossbar.png");
    this.crossbar.anchor.set(0,0);
    this.crossbar.position.set(192,0);
    this.addChild(this.crossbar);

    this.crossbar = makeSprite("Art/crossbar.png");
    this.crossbar.anchor.set(0,0);
    this.crossbar.position.set(192,game.height - 18);
    this.addChild(this.crossbar);

    // this.edit_mode = null;

    this.mode = "inactive";
  }


  startPlay() {
    let self = this;

    setMusic("music_1");
    if (current_music != null) {
        current_music.on('end', function(){
            console.log("HEY THIS IS SUPPOSED TO END THE TIME");
            self.start_time = game.markTime();
            self.step = 0;
            self.hey.text = "SOUP BREAK";
            self.hey.visible = true;
            self.mode = "prep";
        });
    }

    this.makeDancers();

    this.mode = "prep";
    this.start_time = game.markTime();
    this.step = 0;
    this.clear_now = false;

    this.board = {};
    for (let i = 0; i < 20; i++) {
        this.board[i] = {};
        for (let j = 0; j < 20; j++) {
            this.board[i][j] = null;
        }
    }

    this.left_drop = null;
    this.right_drop = null;

    this.tiles = [];
  }


  makeDancers() {
    let self = this;

    this.hey = new PIXI.Text("HEY!", {fontFamily: default_font, fontSize: 70, fill: 0xFFFFFF, letterSpacing: 8, align: "center"});
    this.hey.anchor.set(0.5,0.5);
    this.hey.position.set(game.width / 2, game.height / 2 - 250);
    this.addChild(this.hey);
    this.hey.visible = false;

    this.dance_guy_1 = makeAnimatedSprite("Art/dance.json", "dance");
    this.dance_guy_1.anchor.set(0.5, 0.75);
    this.dance_guy_1.position.set(game.width / 2 - 200, game.height / 2 - 150);
    this.dance_guy_1.loop = true;
    this.dance_guy_1.o_x = this.dance_guy_1.x;
    this.dance_guy_1.gotoAndStop(3);
    this.dance_guy_1.animationSpeed = 0.125;
    this.dance_guy_1.play();
    this.dance_guy_1.onFrameChange = function() {
        if (self.dance_guy_1.currentFrame == 1)
            makeSmoke(self, self.dance_guy_1.x + 45, self.dance_guy_1.y, 1, 1);
        if (self.dance_guy_1.currentFrame == 4)
            makeSmoke(self, self.dance_guy_1.x - 45, self.dance_guy_1.y, 1, 1);
    }
    this.addChild(this.dance_guy_1);
    let x_1 = this.dance_guy_1.x;
    let y_1 = this.dance_guy_1.y;
    this.dance_guy_1.tween = new TWEEN.Tween(this.dance_guy_1)
    .to({x: x_1 - 15})
    .duration(420)
    .easing(TWEEN.Easing.Cubic.InOut)
    .repeat(Infinity)
    .yoyo(true)
    .start();

    this.dance_guy_2 = makeAnimatedSprite("Art/dance.json", "dance");
    this.dance_guy_2.anchor.set(0.5, 0.75);
    this.dance_guy_2.position.set(game.width / 2 + 200, game.height / 2 - 150);
    this.dance_guy_2.gotoAndStop(0);
    this.dance_guy_2.loop = true;
    this.dance_guy_2.animationSpeed = 0.125;
    this.dance_guy_2.play();
    this.dance_guy_2.onFrameChange = function() {
        if (self.dance_guy_2.currentFrame == 1)
            makeSmoke(self, self.dance_guy_2.x + 45, self.dance_guy_2.y, 1, 1);
        if (self.dance_guy_2.currentFrame == 4)
            makeSmoke(self, self.dance_guy_2.x - 45, self.dance_guy_2.y, 1, 1);
    }
    this.addChild(this.dance_guy_2);
    let x_2 = this.dance_guy_2.x;
    let y_2 = this.dance_guy_2.y;
    this.dance_guy_2.tween = new TWEEN.Tween(this.dance_guy_2)
    .to({x: x_2 + 15})
    .duration(420)
    .easing(TWEEN.Easing.Cubic.InOut)
    .repeat(Infinity)
    .yoyo(true)
    .start();
  }


  addDrop(side, x, y) {
    let self = this;

    let color = pick(block_colors)
    let drop = {};

    drop.side = side;
    drop.list = [];
    drop.state = "cool";
    drop.side_effect = null;
    drop.tall = false;

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

    let d = dice(100);

    if (d < 8) {
        console.log("BIG BOY");
        drop.tall = true;
        drop.c_y += 7;
        for (let j = 0; j < 13; j++) {
            let block = makeSprite("Art/block.png");
            block.tint = color;
            block.anchor.set(0, 0);
            block.clear_step = 0;
            block.state = "normal";
            this.setPosition(block, x, drop.c_y + j - 6);
            drop.list.push(block);
            this.play_mat.addChild(block);
        }
    } else if (d < 16) {
        console.log("NICE BOY");
        for (let j = 0; j <= 2; j++) {
            let block = makeSprite("Art/block.png");
            block.tint = color;
            block.anchor.set(0, 0);
            block.clear_step = 0;
            block.state = "normal";
            this.setPosition(block, x, drop.c_y + j - 1);
            drop.list.push(block);
            this.play_mat.addChild(block);
        }
    } else {
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
    }

    drop.dot = makeSprite("Art/dot.png");
    this.setPosition(drop.dot, drop.c_x, drop.c_y);
    this.play_mat.addChild(drop.dot);

    return drop;
  }


  setPosition(block, x, y) {
    block.position.set(360 + 36 * x, 18 + 36 * (24 - y));
    block.c_x = x;
    block.c_y = y;
  }


  dropDrop(drop) {

    this.checkDrop(drop);
    if (drop.state == "uncool") return false;

    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        this.setPosition(drop.list[i], block.c_x, block.c_y - 1);

        if (drop.side_effect == "up") {
            this.setPosition(block, block.c_x, block.c_y + 2);
        } else if (drop.side_effect == "down") {
            if (block.c_y > 0)
                this.setPosition(block, block.c_x, block.c_y - 1);
        }
    }

    drop.c_y -= 1;

    if (drop.side_effect == "up") {
        drop.c_y += 2;
    } else if (drop.side_effect == "right") {
        this.moveRight(drop, false);
    } else if (drop.side_effect == "left") {
        this.moveLeft(drop, false);
    } else if (drop.side_effect == "down") {
        drop.c_y -= 1;
    }

    this.setPosition(drop.dot, drop.c_x, drop.c_y);

    this.checkTiles(drop);
  }


  addTile() {
    // First, compute legal area
    let legal_area = [];
    for (let x = 0; x < 20; x++) {
        for (let y = 1; y <= 20; y++) {
            let legal = true;

            if (this.left_drop != null) {
                for (let i = 0; i < this.left_drop.list.length; i++) {
                    let block = this.left_drop.list[i];
                    if (block.c_x == x && block.c_y == y) {
                        legal = false
                        break;
                    }
                }
            }

            if (legal == true && this.right_drop != null) {
                for (let i = 0; i < this.right_drop.list.length; i++) {
                    let block = this.right_drop.list[i];
                    if (block.c_x == x && block.c_y == y) {
                        legal = false
                        break;
                    }
                }
            }

            if (this.board[x] != null && this.board[x][y] != null) legal = false;
            if (this.board[x] != null && this.board[x][y - 1] != null) legal = false;

            if (legal) legal_area.push([x, y]);
        }
    }

    let tile_type = pick(tile_types);

    if (tile_type != "warp") {
        let tile_position = pick(legal_area);
        console.log(tile_type);
        let tile = makeAnimatedSprite("Art/" + tile_type + "_tile.json", "animation")
        tile.anchor.set(0,0);
        tile.animationSpeed = 0.0625;
        tile.status = "alive";
        tile.type = tile_type;
        tile.start = game.markTime();
        // tile.loop = true;
        tile.play();
        this.setPosition(tile, tile_position[0], tile_position[1]);
        this.tiles.push(tile);
        this.addChild(tile);
    }
  }


  checkTiles(drop) {
    let got_one = false;
    let swap = false;
    let disintegrate = false;
    let darkness = false;
    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];

        for (let k = 0; k < this.tiles.length; k++) {
            let tile = this.tiles[k];

            if (tile.status == "alive" && block.c_x == tile.c_x && block.c_y == tile.c_y) {
                if (tile.type == "left" || tile.type == "right" || tile.type == "down" || tile.type == "up") {
                    drop.side_effect = tile.type;
                    got_one = true;
                    tile.status = "dead";
                    tile.visible = false;
                    makeBlastEnergy(this, 0xFFFFFF, tile.x + 18, tile.y + 18, 1, 1);
                }

                if (tile.type == "swap" && this.left_drop != null && this.right_drop != null) {
                    got_one = true;
                    swap = true;
                    tile.status = "dead";
                    tile.visible = false;
                    makeBlastEnergy(this, 0xFFFFFF, tile.x + 18, tile.y + 18, 1, 1);
                }

                if (tile.type == "darkness") {
                    got_one = true;
                    tile.status = "dead";
                    tile.visible = false;
                    darkness = true;
                    makeBlastEnergy(this, 0xFFFFFF, tile.x + 18, tile.y + 18, 1, 1);
                }

                if (tile.type == "disintegrate") {
                    got_one = true;
                    disintegrate = true;
                    tile.status = "dead";
                    tile.visible = false;
                    makeBlastEnergy(this, 0xFFFFFF, tile.x + 18, tile.y + 18, 1, 1);
                }
            }
        }
    }

    if (swap) {
        let diff_x = this.left_drop.c_x - this.right_drop.c_x;
        let diff_y = this.left_drop.c_y - this.right_drop.c_y;

        for (let i = 0; i < this.left_drop.list.length; i++) {
            let block = this.left_drop.list[i];
            this.setPosition(block, block.c_x - diff_x, block.c_y - diff_y);
        }
        this.left_drop.c_x -= diff_x;
        this.left_drop.c_y -= diff_y;
        this.setPosition(this.left_drop.dot, this.left_drop.c_x, this.left_drop.c_y);

        for (let i = 0; i < this.right_drop.list.length; i++) {
            let block = this.right_drop.list[i];
            this.setPosition(block, block.c_x + diff_x, block.c_y + diff_y);
        }
        this.right_drop.c_x += diff_x;
        this.right_drop.c_y += diff_y;
        this.setPosition(this.right_drop.dot, this.right_drop.c_x, this.right_drop.c_y);

        let temp = this.right_drop;
        this.right_drop = this.left_drop;
        this.left_drop = temp;

        this.safety(this.left_drop);
        this.safety(this.right_drop);
    }

    if (disintegrate) {
        for (let i = 0; i < drop.list.length; i++) {
            let block = drop.list[i];
            let d = dice(100);
            if (d < 25) {
                if (block.c_x > 0) this.setPosition(block, block.c_x - 1, block.c_y);
            } else if (d < 50) {
                if (block.c_x < 19) this.setPosition(block, block.c_x + 1, block.c_y);
            } else if (d < 75) {
                if (block.c_y > 0) this.setPosition(block, block.c_x, block.c_y - 1);
            } else if (d < 100) {
                this.setPosition(block, block.c_x, block.c_y + 1);
            }
        }
    }

    if (darkness) {
        game.fadeToBlack(225.55 * 2);

        delay(function() {
            game.fadeFromBlack(225.55 * 2);
        }, 225.55 * 4);
    }

    if (got_one) {
        soundEffect("tile");
        for (let i = 0; i < drop.list.length; i++) {
            let block = drop.list[i];
            flicker(block, 225, block.tint, 0xFFFFFF);
        }
    }
  }


  checkDrop(drop) {
    let done = false;
    let dead = false;

    if (drop == null) return;

    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        if (block.c_y == 1 || this.board[block.c_x][block.c_y - 1] != null) done = true;
    }

    if (done) {
        soundEffect("place");
        for (let i = 0; i < drop.list.length; i++) {
            let block = drop.list[i];
            this.board[block.c_x][block.c_y] = block;
            if (block.c_y > 24) {
                dead = true;
            }
            block.tint = finished_block_color;
            game.addShake(block);
            for (let k = 0; k < this.tiles.length; k++) {
                let tile = this.tiles[k];
                if (tile.c_x == block.c_x && tile.c_y == block.c_y) {
                    tile.status = "dead";
                    tile.visible = false;
                }
            }
        }
        this.play_mat.removeChild(drop.dot);
        drop.state = "uncool";

        if (!dead) this.checkClear();
    }

    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        if ((drop.tall == false && block.c_y > 30) || (drop.tall == true && block.c_y > 40)) {
            this.play_mat.removeChild(drop.dot);
            drop.state = "uncool";
        }
    }

    if (dead) {
        this.mode = "dead";
        soundEffect("game_over");
        stopMusic();

        for (let x = 0; x < 20; x++) {
            for (let y = 1; y <= 24; y++) {
                if (this.board[x][y] != null) {
                    this.board[x][y].vx = -10 + 20 * Math.random();
                    this.board[x][y].vy = -5 - 10 * Math.random();
                    this.board[x][y].floor = 1500;
                    this.board[x][y].parent = this.play_mat;
                    game.freefalling.push(this.board[x][y]);
                }
            }
        }
        if (this.left_drop != null) {
            for (let i = 0; i < this.left_drop.list.length; i++) {
                let block = this.left_drop.list[i];
                block.vx = -10 + 20 * Math.random();
                block.vy = -5 - 10 * Math.random();
                block.floor = 1500;
                block.parent = this.play_mat;
                game.freefalling.push(block);
            }
            this.play_mat.removeChild(this.left_drop.dot);
        }
        if (this.right_drop != null) {
            for (let i = 0; i < this.right_drop.list.length; i++) {
                let block = this.right_drop.list[i];
                block.vx = -10 + 20 * Math.random();
                block.vy = -5 - 10 * Math.random();
                block.floor = 1500;
                block.parent = this.play_mat;
                game.freefalling.push(block);
            }
            this.play_mat.removeChild(this.right_drop.dot);
        }

        delay(function() {
            game.screens["title"].initializeScreen();
            game.switchScreens("game", "title", -1, 0);
        }, 2000);
    }
  }


  checkClear() {
    let clear = false;
    for (let y = 1; y <= 24; y++) {
        let line_clear = true;
        for (let x = 0; x < 20; x++) {
            if (this.board[x][y] == null) {
                line_clear = false;
                break;
            }
        }
        if (line_clear) {
            clear = true;
            for (let x = 0; x < 20; x++) {
                if (this.board[x][y] != null) {
                    // this.play_mat.removeChild(this.board[x][y]);
                    // this.board[x][y] = null;
                    flicker(this.board[x][y], 225, this.board[x][y].tint, 0xFFFFFF);
                    this.board[x][y].state = "wack";
                }
            }
            for (let y2 = y + 1; y2 <= 24; y2++) {
                for (let x = 0; x < 20; x++) {
                    if (this.board[x][y2] != null) this.board[x][y2].clear_step += 1;
                }
            }
        }
    }
    if (clear) {
        this.step += 2;
        soundEffect("clear");
        this.clear_now = true;
    }
  }


  finishClear() {
    if (this.clear_now == false) return;

    for (let y = 24; y >= 1; y--) {
        for (let x = 0; x < 20; x++) {
            if (this.board[x][y] != null && this.board[x][y].state === "wack") {
                this.play_mat.removeChild(this.board[x][y]);
                this.board[x][y] = null;
            }
        }
    }

    for (let y = 1; y <= 24; y++) {
        for (let x = 0; x < 20; x++) {
            let block = this.board[x][y];
            if (block != null && block.clear_step != 0) {
                console.log(x + "," + y + "," + block.c_x + "," + block.c_y + "," + block.clear_step);
                this.setPosition(block, block.c_x, block.c_y - block.clear_step);
                this.board[block.c_x][block.c_y] = block;
                this.board[x][y] = null;
                block.clear_step = 0;
            }
        }
    }
    this.clear_now = false;
  }


  moveLeft(drop, do_sound = true) {
    let legal = true;
    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        if (block.c_x == 0 || this.board[block.c_x - 1][block.c_y] != null) legal = false;
    }

    if (!legal) return;

    if (do_sound) soundEffect("move");
    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        this.setPosition(block, block.c_x - 1, block.c_y);
    }
    drop.c_x -= 1;
    this.setPosition(drop.dot, drop.c_x, drop.c_y);
  }


  moveRight(drop, do_sound = true) {
    let legal = true;
    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        if (block.c_x == 19 || this.board[block.c_x + 1][block.c_y] != null) legal = false;
    }

    if (!legal) return;

    if (do_sound) soundEffect("move");
    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        this.setPosition(block, block.c_x + 1, block.c_y);
    }
    drop.c_x += 1;
    this.setPosition(drop.dot, drop.c_x, drop.c_y);
  }

  
  rotate(drop) {
    soundEffect("rotate");
    for (let i = 0; i < drop.list.length; i++) {
        let block = drop.list[i];
        let r_x = block.c_x - drop.c_x;
        let r_y = block.c_y - drop.c_y;
        this.setPosition(block, drop.c_x + r_y, drop.c_y - r_x);
    }
    this.safety(drop);
  }

  safety(drop) {

    let right_wall = true;
    while(right_wall) {
        right_wall = false;
        for (let i = 0; i < drop.list.length; i++) {
            let block = drop.list[i];
            if (block.c_x >= 20) {
                right_wall = true;
            }
        }
        if (right_wall) {
            for (let i = 0; i < drop.list.length; i++) {
                let block = drop.list[i];
                this.setPosition(block, block.c_x - 1, block.c_y);
            }
            drop.c_x -= 1;
            this.setPosition(drop.dot, drop.c_x, drop.c_y);
        }
    }
    let left_wall = true;
    while(left_wall) {
        left_wall = false;
        for (let i = 0; i < drop.list.length; i++) {
            let block = drop.list[i];
            if (block.c_x < 0) {
                left_wall = true;
            }
        }
        if (left_wall) {
            for (let i = 0; i < drop.list.length; i++) {
                let block = drop.list[i];
                this.setPosition(block, block.c_x + 1, block.c_y);
            }
            drop.c_x += 1;
            this.setPosition(drop.dot, drop.c_x, drop.c_y);
        }
    }
  }


  handleKeyDown(key) {
    if (this.mode === "active") {
        if (this.left_drop != null) {
            if (key.toLowerCase() === "a") {
                this.moveLeft(this.left_drop);
            }

            if (key.toLowerCase() === "d") {
                this.moveRight(this.left_drop);
            }

            if (key.toLowerCase() === "s") {
                soundEffect("move");
                this.dropDrop(this.left_drop);
                if (this.left_drop.state == "uncool") this.left_drop = null;
            }

            if (key === " " || key.toLowerCase() === "w") {
                this.rotate(this.left_drop);
            }
        }

        if (this.right_drop != null) {
            if (key === "ArrowLeft") {
                this.moveLeft(this.right_drop);
            }

            if (key === "ArrowRight") {
                this.moveRight(this.right_drop);
            }

            if (key === "ArrowDown") {
                soundEffect("move");
                this.dropDrop(this.right_drop);
                if (this.right_drop.state == "uncool") this.right_drop = null;
            }

            if (key === "Enter" || key === "ArrowUp") {
                this.rotate(this.right_drop);
            }
        }
    }
  }


  update(fractional) {
    
    if (this.mode === "prep" && game.timeSince(this.start_time) > 3200) {
        this.mode = "active";

        this.hey.visible = true;
        this.hey.text = "Hey!";
        game.addShake(this.hey);
        this.dance_guy_1.x -= 40;
        this.dance_guy_1.y -= 40;
        this.dance_guy_1.scale.set(1.1, 1.1);
        this.dance_guy_2.x += 40;
        this.dance_guy_2.y -= 40;
        this.dance_guy_2.scale.set(1.1, 1.1);
        this.dance_guy_1.tween.stop();
        this.dance_guy_2.tween.stop();
        this.dance_guy_1.stop();
        this.dance_guy_2.stop();
    }

    if (this.mode === "active" && game.timeSince(this.start_time) > 3651) {
        this.hey.visible = false;
        this.removeChild(this.dance_guy_1);
        this.removeChild(this.dance_guy_2);
    }

    if (this.mode === "active" && game.timeSince(this.start_time) > 3200 + 225.55 * this.step) {
        this.step += 1;

        this.finishClear();

        if (this.left_drop == null) {
            this.left_drop = this.addDrop("left", 5, 26);
        } else {
            if (this.step % 8 != 4 && this.step % 8 != 6 && this.step % 8 != 2)
                this.dropDrop(this.left_drop);
                if (this.left_drop.state == "uncool") this.left_drop = null;
        }

        if (this.right_drop == null) {
            this.right_drop = this.addDrop("right", 15, 26);
        } else {
            if (this.step % 8 != 4 && this.step % 8 != 6 && this.step % 8 != 2)
                this.dropDrop(this.right_drop);
                if (this.right_drop.state == "uncool") this.right_drop = null;
        }

        if (this.tiles.length < 4 && dice(100) < 20) {
            //this.addTile();
        }

        let new_tiles = [];
        for (let k = 0; k < this.tiles.length; k++) {
            let tile = this.tiles[k];
            if (game.timeSince(tile.start) > 225.55 * 48) tile.status = "dead";
            if (tile.status == "alive") {
                new_tiles.push(tile);
            } else {
                this.removeChild(tile);
            }
        }
        this.tiles = new_tiles;
    }

    game.shakeThings();
    game.freeeeeFreeeeeFalling(fractional);
  };
};

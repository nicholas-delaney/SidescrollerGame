class GameState_LevelSelect {
	constructor() {
		this.entityManager = new EntityManager();
		this.title = "Level Select";
		this.menuStrings = [];
		this.menuPaths = [];
		this.menuIndex = 0;
		this.levels = levels;
		this.menu = this.entityManager.addEntity("menu");
		this.init();
	}
	init() {
		for (let i in this.levels) {
			this.menuStrings.push(this.levels[i].name);
			this.menuPaths.push(this.levels[i].levelData);
		}
		this.menu.addComponent(new CInput());
		this.menu.addComponent(new CLifespan(500));
	}
	// main level select menu loop
	update() {
		this.entityManager.update();
		if (this.menu.getComponent("input").canShoot) {
			this.sUserInput();
		}
		this.sLifespan();
		this.sRender();
	}
	// lifespan to avoid multiple inputs on one key press
	sLifespan() {
		let newTime = new Date().getTime();
		let clickTime = newTime - this.menu.getComponent("lifespan").start;
		if (clickTime >= this.menu.getComponent("lifespan").time) {
			this.menu.getComponent("input").canShoot = true;
			this.menu.getComponent("lifespan").start = newTime;
		}
	}
	// handle user input 
	sUserInput() {
		let m = this.menu;
		// keyboard input
		document.onkeydown = function(event) {
			if(event.keyCode === 83)      { m.getComponent("input").down = true; }  // s
			else if(event.keyCode === 87) { m.getComponent("input").up = true; }    // w
			else if(event.keyCode === 32) { m.getComponent("input").space = true; } // space
			else if(event.keyCode === 27) { m.getComponent("input").esc = true; }
		}
		document.onkeyup = function(event) {
			if(event.keyCode === 83)      { m.getComponent("input").down = false; } // s
			else if(event.keyCode === 87) { m.getComponent("input").up = false; }   // w
			else if(event.keyCode === 32) { m.getComponent("input").space = false; } // space
			else if(event.keyCode === 27) { m.getComponent("input").esc = false; }
		}
		
		if (m.getComponent("input").up) {
			this.menuIndex = (this.menuIndex > 0) ? this.menuIndex - 1 : this.menuStrings.length - 1;
			this.menu.getComponent("input").canShoot = false;
		}
		else if (m.getComponent("input").down) {
			this.menuIndex = (this.menuIndex + 1) % this.menuStrings.length;
			this.menu.getComponent("input").canShoot = false;
		}
		else if (m.getComponent("input").space) {
			m.getComponent("input").space = false;
			play = new GameState_Play(canvas, wrapper, this.menuPaths[this.menuIndex]);
			game.pushState("play");
		}
		else if (m.getComponent("input").esc) {
			m.getComponent("input").esc = false;
			game.popState();
		}		
	}
	// clear old frame / draw new frame
	sRender() {
		// start new frame
		wrapper.scrollLeft = 0;
		wrapper.scrollTop = 0;
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.drawImage(assets.getMap(2), 0, 0, canvasWidth,canvasHeight);		
		// draw title
		ctx.font = "bold 50px Impact";
		ctx.fillStyle = "black";
		ctx.fillText(this.title, 160, 45);		
		// draw menu options 
		ctx.font = "40px Impact";
		for (let i = 1; i < this.menuStrings.length + 1; i++) {
			ctx.fillStyle = (i-1 === this.menuIndex) ? "#AA1892" : "#DD1021";
			ctx.font = (i - 1 === this.menuIndex) ? "45px Impact" : "40px Impact";
			ctx.fillText(this.menuStrings[i-1], 180, 50 * i + 50);
		}
		ctx.font = "40px Impact";
		ctx.fillStyle = "white";
		ctx.fillRect(150, 25  + (50 * (this.menuIndex + 1)), 20, 20);
		// draw game play instructions
		ctx.fillStyle = "black";
		ctx.fillRect(580, 50, 700, 300);
		ctx.fillStyle = "white";
		ctx.fillText("Game Play Instructions:", 600, 100);
		ctx.fillStyle = "red";
		ctx.font = "30px Impact";
		ctx.fillText("- Move player with WASD keys", 600, 130);
		ctx.fillText("- Shoot with SPACE key", 600, 160);
		ctx.fillText( "- Change Weapon with Q key", 600, 190);
		ctx.fillText( "- Reach the giant sword to win the level!", 600, 220);
		ctx.fillText( "- Return to the menus with the ESC key", 600, 250);
		ctx.fillText( "- Go make a custom level in LEVEL EDITOR and", 600, 300);
		ctx.fillText( "  it will show up here!", 600, 330);
	}
}
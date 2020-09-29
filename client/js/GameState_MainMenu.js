class GameState_MainMenu {
	constructor() {
		this.entityManager = new EntityManager();
		this.title = "";
		this.menuStrings = [];
		this.menuPaths = [];
		this.menuIndex = 0;
		this.menu = this.entityManager.addEntity("menu");
		this.init();
	}
	// initialise main menu
	init() {
		this.title = "SUPER MERLE";
		this.menuStrings = ["Play Game", "Level Editor"];
		this.menuPaths = ["levelSelect", "levelEditor"];
		this.menu.addComponent(new CInput());
		this.menu.addComponent(new CLifespan(500));
	}
	// main menu main update loop
	update() {
		this.entityManager.update();
		if (this.menu.getComponent("input").canShoot) {
			this.sUserInput();
		}
		this.sLifespan();
		this.sRender();
	}
	// handle user input
	sUserInput() {
		let m = this.menu;
		// keyboard input
		document.onkeydown = function (event) {
			if (event.keyCode === 83) { m.getComponent("input").down = true; }  // s
			else if (event.keyCode === 87) { m.getComponent("input").up = true; }    // w
			else if (event.keyCode === 32) { m.getComponent("input").space = true; } // space
			else if (event.keyCode === 27) { m.getComponent("input").esc = true; }   // esc
		}
		document.onkeyup = function (event) {
			if (event.keyCode === 83) { m.getComponent("input").down = false; }  // s
			else if (event.keyCode === 87) { m.getComponent("input").up = false; }    // w
			else if (event.keyCode === 32) { m.getComponent("input").space = false; } // space
			else if (event.keyCode === 27) { m.getComponent("input").esc = false; }   // esc
		}
		// cycle through menu options
		if (m.getComponent("input").up) {
			this.menuIndex = (this.menuIndex > 0) ? this.menuIndex - 1 : this.menuStrings.length - 1;
			this.menu.getComponent("input").canShoot = false;
		}
		else if (m.getComponent("input").down) {
			this.menuIndex = (this.menuIndex + 1) % this.menuStrings.length;
			this.menu.getComponent("input").canShoot = false;
		}
		// select currently active menu option
		else if (m.getComponent("input").space) {
			m.getComponent("input").space = false;
			game.pushState(this.menuPaths[this.menuIndex]);
		}
		// quit the game
		else if (m.getComponent("input").esc) {
			game.quit();
		}
	}
	// lifespan to avoid multiple inputs on one key press
	sLifespan() {
		let newTime = new Date().getTime();
		let clickTime = newTime - this.menu.getComponent("lifespan").start;
		if (clickTime >= this.menu.getComponent("lifespan").time) {
			this.menu.getComponent("lifespan").start = newTime;
			this.menu.getComponent("input").canShoot = true;
		}
	}
	// clear old frame / draw new frame
	sRender() {
		// start new frame
		wrapper.scrollLeft = 0;
		wrapper.scrollTop = 0;
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.drawImage(assets.getMap(2), 0, 0, canvasWidth, canvasHeight);
		// draw title
		ctx.fillStyle = "red";
		ctx.fillRect(460, 20, 330, 70);
		ctx.font = "60px Impact";
		ctx.fillStyle = "black"
		ctx.fillText(this.title, 470, 80);
		// draw menu options 
		ctx.font = "40px Impact";
		for (let i = 1; i < this.menuStrings.length + 1; i++) {
			ctx.globalAlpha = 0.8;
			ctx.fillStyle = (i - 1 === this.menuIndex) ? "#000000" : "#DD1021";
			ctx.font = (i - 1 === this.menuIndex) ? "45px Impact" : "40px Impact";
			ctx.fillRect(480, 50 * i + 90, 220, 40);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "white";
			ctx.fillText(this.menuStrings[i - 1], 480, 50 * i + 120);
		}
		ctx.fillRect(450, 95 + ((this.menuIndex + 1) * 50), 20, 20);
		// draw author credits
		ctx.fillStyle = "#DD1021";
		ctx.fillRect(20, 290, 290, 100);
		ctx.fillStyle = "white";
		ctx.font = "20px Impact";
		ctx.fillText("Created by: Nicholas Delaney", 40, 330);
		ctx.fillText("nicholasndelaney@gmail.com", 40, 360);
		// draw menus instructions
		ctx.fillStyle = "#FF1212"
		ctx.fillText("MENUS INSTRUCTIONS", 450, 330);
		ctx.fillStyle = "white"
		ctx.fillText("W:", 450, 355);
		ctx.fillText("S:", 450, 380);
		ctx.fillText("Space:", 450, 405);
		ctx.fillText("Esc:", 450, 430);
		ctx.fillText("UP", 520, 355);
		ctx.fillText("DOWN", 520, 380);
		ctx.fillText("SELECT", 520, 405);
		ctx.fillText("BACK", 520, 430);
	}
}
// manage which update to call depending on state of the game
class GameEngine {
	constructor() {
		this.states = [];
		this.statesToPush = [];
		this.popStates = 0;
		this.running = true;
		this.gameInit();
	}
	// start game off in main menu
	gameInit() {
		this.pushState("mainMenu");
	}
	// manage game state if it's been changed
	update() {

		if (!this.running) { return; }
		// pop states
		for (let i = 0; i < this.popStates; i++) {
			if (this.states.length > 0) {
				this.states.pop();
			}
		}
		this.popStates = 0;
		// push states that have been pushed
		for (let i = 0; i < this.statesToPush.length; i++) {
			this.states.push(this.statesToPush[i]);
		}	
		this.statesToPush = [];
		// determing which update loop to run depending on state
		if (this.states.length > 0) {
			if (this.states[this.states.length - 1] === "play") {
				play.update();
			}
			else if (this.states[this.states.length - 1] === "levelEditor") {
				levelEditor.lupdate();
			}
			else if (this.states[this.states.length - 1] === "mainMenu") {
				mainMenu.update();
			}
			else if (this.states[this.states.length - 1] === "levelSelect") {
				levelSelect.update();
			}
		}
	}
	pushState(state) {
		this.statesToPush.push(state);
	}	
	popState() {
		this.popStates++;
	}	
	quit() {
		this.running = false;
	}	
	// run current state update loop
	run () {
		if (this.running) {
			this.update();
		}
	}
}
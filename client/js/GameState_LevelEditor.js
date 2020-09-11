class GameState_LevelEditor {
	constructor(canvas, wrapper) {
		this.entityManager = new EntityManager();
		this.editor = this.entityManager.addEntity("editor");
		this.tileUI = this.entityManager.addEntity("editUI");
		this.mTileUI = this.entityManager.addEntity("editUI");
		this.decUI = this.entityManager.addEntity("editUI");
		this.enemyUI = this.entityManager.addEntity("editUI");
		this.mEnemyUI = this.entityManager.addEntity("editUI");
		this.spawnUI = this.entityManager.addEntity("editUI");
		this.deleteUI = this.entityManager.addEntity("editUI");
		this.saveUI = this.entityManager.addEntity("editUI");
		this.loadUI = this.entityManager.addEntity("editUI");
		this.snapUI = this.entityManager.addEntity("editUI");
		this.instructionUI = this.entityManager.addEntity("editUI");
		this.snap = true;
		this.pSpawnPointSet = false;
		this.canvas = canvas;
		this.wrapper = wrapper;
		this.ctx = canvas.getContext("2d");
		this.p1 = -1;
		this.p2 = -1;
		this.p1Set = false;
		this.le_spawnEditor();
	}
	// spawn the level editor initial state
	le_spawnEditor() {
		// you
		this.editor.addComponent(new CTransform(100, 1000));
		this.editor.getComponent("transform").speed = { x: 22, y: 22 };
		this.editor.addComponent(new CBoundingBox(50, 50));
		this.editor.addComponent(new CInput());
		this.editor.addComponent(new CState("none"));
		this.editor.addComponent(new CMouse());
		this.editor.addComponent(new CId(1));
		// editor UI
		this.entityManager.update();
		let UIs = this.entityManager.getEntities("editUI");;
		for (let i in UIs) {
			UIs[i].addComponent(new CTransform(150 + i * 75, 1000));
			UIs[i].addComponent(new CBoundingBox(50, 50));
		}
		this.tileUI.addComponent(new CState("tile"));
		this.tileUI.addComponent(new CStatus(true));
		this.decUI.addComponent(new CState("dec"));
		this.enemyUI.addComponent(new CState("enemy"));
		this.mEnemyUI.addComponent(new CState("mEnemy"));
		this.spawnUI.addComponent(new CState("spawn"));
		this.deleteUI.addComponent(new CState("delete"));
		this.saveUI.addComponent(new CState("save"));
		this.loadUI.addComponent(new CState("load"));
		this.snapUI.addComponent(new CState("snap"));
		this.snapUI.addComponent(new CStatus(true));
		this.mTileUI.addComponent(new CState("mTile"));
		this.instructionUI.addComponent(new CState("instructions"));
		this.instructionUI.addComponent(new CStatus(false));
		// initial spawn and end points for player
		let spawn = this.entityManager.addEntity("spawn");
		spawn.addComponent(new CTransform(100, 1300));
		spawn.addComponent(new CBoundingBox(45, 75));
		let end = this.entityManager.addEntity("end");
		end.addComponent(new CTransform(3000, 1300));
		end.addComponent(new CBoundingBox(50, 120));
	}
	// decides what to do depending on current editor state via UI and mouse click
	le_sEdit() {
		let tag = this.editor.getComponent("state").state;
		let id = this.editor.getComponent("id").id;
		if (this.editor.getComponent("mouse").mouseClick) {
			if (tag === "tile" || tag === "dec" || tag === "enemy" || tag === "mTile" || tag === "mEnemy" || tag === "spawn") {
				this.le_spawnEntity(tag, id);
			}
			else if (tag === "delete") {
				this.le_deleteEntity();
			}
		}
		else if (tag === "snap") {
			this.snapUI.getComponent("status").status = !this.snapUI.getComponent("status").status;
			this.editor.getComponent("state").state = "none";
		}
		else if (tag === "instructions") {
			this.instructionUI.getComponent("status").status = !this.instructionUI.getComponent("status").status;
			this.editor.getComponent("state").state = "none";
		}
		else if (tag === "save") {
			this.editor.getComponent("state").state = "none";
			this.le_saveLevel();
		}
		else if (tag === "load") {
			this.editor.getComponent("state").state = "none";
			this.le_loadLevel();
		}
		this.editor.getComponent("mouse").mouseClick = false;
	}
	// get position of entity with snap-to-grid style effect
	getSnapLocation(cx, cy) {
		let tileSize = 50;
		let snapPosLowX = cx - (cx % tileSize);
		let snapPosHighX = snapPosLowX + 50;
		let snapPosLowY = cy - (cy % tileSize);
		let snapPosHighY = snapPosLowY + 50;
		let x = (cx - snapPosLowX >= snapPosHighX - cx) ? snapPosHighX : snapPosLowX;
		let y = (cy - snapPosLowY >= snapPosHighY - cy) ? snapPosHighY : snapPosLowY;
		return { x, y };
	}
	// spawn appropriate entity given tag and id
	le_spawnEntity(tag, id) {
		let x = this.editor.getComponent("mouse").coords.x - 25;
		let y = this.editor.getComponent("mouse").coords.y - 25;
		let pos = (this.snapUI.getComponent("status").status) ? this.getSnapLocation(x, y) : { x: x, y: y };
		if (tag === "tile") {
			let newEntity = this.entityManager.addEntity(tag);
			newEntity.addComponent(new CTransform(pos.x, pos.y));
			newEntity.addComponent(new CBoundingBox(50, 50));
			newEntity.addComponent(new CId(id));
		}
		else if (tag === "dec") {
			let newEntity = this.entityManager.addEntity(tag);
			newEntity.addComponent(new CTransform(pos.x, pos.y));
			newEntity.addComponent(new CBoundingBox(canvasWidth, canvasHeight));
			newEntity.addComponent(new CId(id));
		}
		else if (tag === "enemy") {
			let newEntity = this.entityManager.addEntity(tag);
			newEntity.addComponent(new CTransform(pos.x, pos.y));
			newEntity.addComponent(new CBoundingBox(50, 100));
			newEntity.addComponent(new CId(id));
		}
		else if (tag === "mTile" || tag === "mEnemy") {
			if (!this.p1Set) {
				this.p1 = pos.x;
				this.p1Set = true;
			}
			else {
				this.p2 = pos.x;
				this.p1Set = false;
				if (this.p1 > this.p2) {
					let p = this.p2;
					this.p2 = this.p1;
					this.p1 = p;
				}
				let newTag = (tag === "mTile") ? "tile" : "enemy";
				let newEntity = this.entityManager.addEntity(newTag);
				newEntity.addComponent(new CTransform(pos.x, pos.y));
				newEntity.addComponent(new CBoundingBox(50, 50));
				newEntity.addComponent(new CId(id));
				newEntity.addComponent(new CMovingTile(this.p1, this.p2));
			}
		}
		else if (tag === "spawn") {
			tag = (!this.pSpawnPointSet) ? "spawn" : "end";
			this.pSpawnPointSet = !this.pSpawnPointSet;
			this.entityManager.getEntities(tag)[0].destroy();
			let newEntity = this.entityManager.addEntity(tag);
			newEntity.addComponent(new CTransform(pos.x, pos.y))
			newEntity.addComponent(new CBoundingBox(47, 75));
		}
	}
	// delete tiles, decs or enemies if they're clicked on in delete state
	le_deleteEntity() {
		let mPos = this.editor.getComponent("mouse").coords;
		let t = this.entityManager.getEntities("tile");
		let d = this.entityManager.getEntities("dec");
		let e = this.entityManager.getEntities("enemy");
		let mT = this.entityManager.getEntities("mTile");
		let ents = t.concat(d, e, mT);
		for (let i = 0; i < ents.length - 1; i++) {
			let ePos = ents[i].getComponent("transform").pos;
			let eSize = ents[i].getComponent("boundingBox").size;
			if (mPos.x >= ePos.x && mPos.x <= ePos.x + eSize.x && mPos.y >= ePos.y && mPos.y <= ePos.y + eSize.y) {
				ents[i].destroy();
				break;
			}
		}
	}
	// load desired entities into level editor
	loadLevel(lvlData) {
		// delete currently active entities
		let t = this.entityManager.getEntities("tile");
		let d = this.entityManager.getEntities("dec");
		let e = this.entityManager.getEntities("enemy");
		let oldEnts = t.concat(d, e);
		for (let i  in oldEnts) {
			oldEnts[i].destroy();
		}
		// load new entities
		let entities = lvlData.levelData;
		for (let i in entities) {
			let e = entities[i];
			if (e.type === "tile") {
				let newEntity = this.entityManager.addEntity("tile");
				newEntity.addComponent(new CTransform(e.pos.x, e.pos.y));
				newEntity.addComponent(new CBoundingBox(e.size.x, e.size.y));
				newEntity.addComponent(new CId(e.texture));
			}
			else if (e.type === "dec") {
				let newEntity = this.entityManager.addEntity("dec");
				newEntity.addComponent(new CTransform(e.pos.x, e.pos.y));
				newEntity.addComponent(new CBoundingBox(e.size.x, e.size.y));
				newEntity.addComponent(new CId(e.texture));
			}
			else if (e.type === "enemy") {
				let newEntity = this.entityManager.addEntity("enemy");
				newEntity.addComponent(new CTransform(e.pos.x, e.pos.y));
				newEntity.getComponent("transform").size = { x: 78, y: 49 };
				newEntity.getComponent("transform").scale = { x: 3, y: 3 };
				newEntity.addComponent(new CBoundingBox(40, 80));
				newEntity.addComponent(new CGravity(2));
				newEntity.addComponent(new CId(e.texture));
				let name = (e.texture === 1) ? "enemy1" : "enemy2";
				newEntity.addComponent(new CStats(20, name));
				newEntity.addComponent(new CLifespan(4000));
				newEntity.addComponent(new CState("chilling"));
				newEntity.addComponent(new CInput());
				newEntity.addComponent(new CImmune(500));
				newEntity.addComponent(new CAnimation(6, assets.getEnemy(e.texture).idle, true));
				if (e.patrol) {
					newEntity.addComponent(new CMovingTile(e.move.x1, e.move.x2));
				}
			}
			else if (e.type === "mTile") {
				let newEntity = this.entityManager.addEntity("tile");
				newEntity.addComponent(new CTransform(e.pos.x, e.pos.y));
				newEntity.addComponent(new CBoundingBox(e.size.x, e.size.y));
				newEntity.addComponent(new CId(e.texture));
				newEntity.addComponent(new CMovingTile(e.move.x1, e.move.x2));
			}
			else if (e.type === "spawn") {
				this.entityManager.getEntities("spawn")[0].destroy();
				let spawn = this.entityManager.addEntity("spawn");
				spawn.addComponent(new CTransform(e.pos.x, e.pos.y));
				spawn.addComponent(new CBoundingBox(45, 75));
			}
			else if (e.type === "end") {
				this.entityManager.getEntities("end")[0].destroy();
				let end = this.entityManager.addEntity("end");
				end.addComponent(new CTransform(e.pos.x, e.pos.y));
				end.addComponent(new CBoundingBox(50, 120))
			}
		}
	}
	// get level data from server / database
	le_loadLevel(lvlData) { 
		let lvlName = prompt("Enter name of level to load and press 'OK");
		socket.emit('loadLevel', {
			name: lvlName
		});
	}
	// send all entity info to server to save to the database
	le_saveLevel() {
		let lvlName = prompt("Enter level name and press 'OK'");
		// check if name is taken
		let entities = [];
		let entity = {};
		// gather all necessary entity info
		let tiles = this.entityManager.getEntities("tile");
		for (let i in tiles) {
			let t = tiles[i];
			entity = {
				type: "tile",
				texture: t.getComponent("id").id,
				pos: {
					x: t.getComponent("transform").pos.x,
					y: t.getComponent("transform").pos.y
				},
				size: {
					x: t.getComponent("boundingBox").size.x,
					y: t.getComponent("boundingBox").size.y
				}
			};
			if (t.hasComponent("movingTile")) {
				entity.type = "mTile";
				entity.move = {
					x1: t.getComponent("movingTile").p1,
					x2: t.getComponent("movingTile").p2
				}
			}
			entities.push(entity);
		}
		let background = this.entityManager.getEntities("dec");
		for (let i in background) {
			let b = background[i];
			entity = {
				type: "dec",
				texture: b.getComponent("id").id,
				pos: {
					x: b.getComponent("transform").pos.x,
					y: b.getComponent("transform").pos.y
				},
				size: {
					x: b.getComponent("boundingBox").size.x,
					y: b.getComponent("boundingBox").size.y
				}
			};
			entities.push(entity);
		}
		let enemies = this.entityManager.getEntities("enemy");
		for (let i in enemies) {
			let e = enemies[i];
			entity = {
				type: "enemy",
				texture: e.getComponent("id").id,
				pos: {
					x: e.getComponent("transform").pos.x,
					y: e.getComponent("transform").pos.y
				},
				speed: {
					x: e.getComponent("transform").speed.x,
					y: e.getComponent("transform").speed.y,
				},
				size: {
					x: e.getComponent("boundingBox").size.x,
					y: e.getComponent("boundingBox").size.y
				}
			};
			if (e.hasComponent("movingTile")) {
				entity.patrol = true;
				entity.move = {
					x1: e.getComponent("movingTile").p1,
					x2: e.getComponent("movingTile").p2
				}
			}
			else {
				entity.patrol = false;
			}
			entities.push(entity);
		}
		let start = this.entityManager.getEntities("spawn")[0]; 
		let end = this.entityManager.getEntities("end")[0];
		entities.push({ type: "spawn", pos: start.getComponent("transform").pos });
		entities.push({ type: "end", pos: end.getComponent("transform").pos });
		// send entity info and level name to the server
		socket.emit('newLevel', {
			name: lvlName,
			levelData: entities,
		});
	}
	// level editor main update loop
	lupdate() {
		// update entity manager
		this.entityManager.update();
		// run all systems (ordered)
		this.le_userInput();
		this.le_sEdit();
		this.le_movement();
		this.le_render();
	}
	// navigate map and check if / which UI is being clicked
	le_userInput() {
		let e = this.editor;
		let canvas = this.canvas;
		let eM = this.entityManager;
		let sUI = this.showUI;
		let showUI = this.tileUI;
		// mouse input
		function currentMouseCoords(event, canvas) {
			let rect = canvas.getBoundingClientRect();
			let x = event.clientX - rect.left;
			let y = event.clientY - rect.top;
			e.getComponent("mouse").current.x = x;
			e.getComponent("mouse").current.y = y;
		}
		function getMouseCoords(event, canvas) {
			let rect = canvas.getBoundingClientRect();
			let x = event.clientX - rect.left;
			let y = event.clientY - rect.top;
			e.getComponent("mouse").coords.x = x;
			e.getComponent("mouse").coords.y = y;
			// check if clicking UIs
			if (showUI.getComponent("status").status) {
				let UIs = eM.getEntities("editUI");
				let size = UIs[0].getComponent("boundingBox").size;
				for (let i = 0; i < UIs.length; i++) {
					let pos = UIs[i].getComponent("transform").pos;
					if (x >= pos.x && x <= pos.x + size.x && y >= pos.y && y <= pos.y + size.y + 10) {
						e.getComponent("state").state = UIs[i].getComponent("state").state;
						e.getComponent("id").id = 1;
						e.getComponent("mouse").mouseClick = false;
					}
				}
			}
		}
		canvas.addEventListener('mousemove', function (evt) {
			currentMouseCoords(evt, canvas);
		})
		canvas.addEventListener('mouseup', function (evt) {
			e.getComponent("mouse").mouseClick = true;
			getMouseCoords(evt, canvas);
		})

		document.onwheel = function (event) {
			if (e.getComponent("state").state === "tile" || e.getComponent("state").state === "mTile") {
				e.getComponent("id").id = (e.getComponent("id").id < 5) ? e.getComponent("id").id + 1 : 1;
			}
			else if (e.getComponent("state").state === "dec") {
				e.getComponent("id").id = (e.getComponent("id").id < 7) ? e.getComponent("id").id + 1 : 1;
			}
			else if (e.getComponent("state").state === "enemy" || e.getComponent("state").state === "mEnemy") {
				e.getComponent("id").id = (e.getComponent("id").id < 2) ? e.getComponent("id").id + 1 : 1;
			}
		}
		// keyboard input
		document.onkeydown = function (event) {
			if (event.keyCode === 68) { e.getComponent("input").right = true; } // d
			else if (event.keyCode === 83) { e.getComponent("input").down = true; }  // s
			else if (event.keyCode === 65) { e.getComponent("input").left = true; }  // a
			else if (event.keyCode === 87) { e.getComponent("input").up = true; }    // w
		}
		document.onkeyup = function (event) {
			if (event.keyCode === 68) { e.getComponent("input").right = false; } // d
			else if (event.keyCode === 83) { e.getComponent("input").down = false; }  // s
			else if (event.keyCode === 65) { e.getComponent("input").left = false; }  // a
			else if (event.keyCode === 87) { e.getComponent("input").up = false; } // w
			else if (event.keyCode === 27) { e.getComponent("input").popState = true; } // esc
			else if (event.keyCode === 81) { e.getComponent("state").state = "none"; } // q
			else if (event.keyCode === 82) { showUI.getComponent("status").status = !showUI.getComponent("status").status } // r
		}
		if (e.getComponent("input").popState) {
			e.getComponent("input").popState = false;
			game.popState();
		}
	}
	// move editor around map depending on user input and move moving enemies / tiles
	le_movement() {
		// lets the editor navigate the map
		let ePos = this.editor.getComponent("transform").pos;
		let eSpeed = this.editor.getComponent("transform").speed;
		let eUI = this.entityManager.getEntities("editUI");
		if (this.editor.getComponent("input").up === true) {
			ePos.y -= eSpeed.y;
			for (let i = 0; i < eUI.length; i++) {
				eUI[i].getComponent("transform").pos.y -= eSpeed.y;
			}
		}
		if (this.editor.getComponent("input").down === true) {
			ePos.y += eSpeed.y;
			for (let i = 0; i < eUI.length; i++) {
				eUI[i].getComponent("transform").pos.y += eSpeed.y;
			}
		}
		if (this.editor.getComponent("input").right === true) {
			ePos.x += eSpeed.x;
			for (let i = 0; i < eUI.length; i++) {
				eUI[i].getComponent("transform").pos.x += eSpeed.x;
			}
		}
		if (this.editor.getComponent("input").left === true) {
			ePos.x -= eSpeed.x;
			for (let i = 0; i < eUI.length; i++) {
				eUI[i].getComponent("transform").pos.x -= eSpeed.x;
			}
		}
		// tile and enemy movement
		let t = this.entityManager.getEntities("tile");
		let e = this.entityManager.getEntities("enemy");
		let mEnts = t.concat(e);
		for (let i = 0; i < mEnts.length; i++) {
			if (mEnts[i].hasComponent("movingTile")) {
				if (mEnts[i].getComponent("transform").pos.x >= mEnts[i].getComponent("movingTile").p2) {
					mEnts[i].getComponent("movingTile").speed = -mEnts[i].getComponent("movingTile").speed;
				}
				else if (mEnts[i].getComponent("transform").pos.x < mEnts[i].getComponent("movingTile").p1) {
					mEnts[i].getComponent("movingTile").speed = -mEnts[i].getComponent("movingTile").speed;
				}
				mEnts[i].getComponent("transform").pos.x += mEnts[i].getComponent("movingTile").speed;
			}
		}
	}
	// draw the whole new frame
	le_render() {
		// clear entire game area to start a new frame
		this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		// scroll map
		this.wrapper.scrollLeft = this.editor.getComponent("transform").pos.x;
		this.wrapper.scrollTop = this.editor.getComponent("transform").pos.y - 20;
		// draw all entities at their position given by CTransform
		let decs = this.entityManager.getEntities("dec");
		for (let i in decs) {
			let d = decs[i];
			let x = d.getComponent("transform").pos.x;
			let y = d.getComponent("transform").pos.y;
			let sX = d.getComponent("boundingBox").size.x;
			let sY = d.getComponent("boundingBox").size.y;
			let img = assets.getMap(d.getComponent("id").id);
			this.ctx.drawImage(img, x, y, sX, sY);;
		}
		let tiles = this.entityManager.getEntities("tile");
		for (let i in tiles) {
			let t = tiles[i];
			let x = t.getComponent("transform").pos.x;
			let y = t.getComponent("transform").pos.y;
			let sX = t.getComponent("boundingBox").size.x;
			let sY = t.getComponent("boundingBox").size.y;
			let img = assets.getTexture(t.getComponent("id").id);
			this.ctx.drawImage(img, x, y, sX, sY);
		}
		let enemies = this.entityManager.getEntities("enemy");
		for (let i in enemies) {
			let e = enemies[i];
			let x = e.getComponent("transform").pos.x;
			let y = e.getComponent("transform").pos.y;
			let img = assets.getEnemy(e.getComponent("id").id).idle[0];
			this.ctx.drawImage(img, x - 80, y - 60, 78 * 3, 49 * 3);
		}
		// draw player spawn point and finish point
		let sPos = this.entityManager.getEntities("spawn")[0].getComponent("transform").pos;
		let ePos = this.entityManager.getEntities("end")[0].getComponent("transform").pos;
		this.ctx.drawImage(assets.getPlayer("idle")[0], 55, 85, 85, 25, sPos.x, sPos.y - 13, 255, 75);
		this.ctx.drawImage(assets.getFinish()[0], ePos.x, ePos.y, 100, 200);
		// draw level editor UI
		if (this.tileUI.getComponent("status").status) {
			this.ctx.fillStyle = "black";
			this.ctx.fillRect(this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y - 10, 840, 80);
			let editUIs = this.entityManager.getEntities("editUI");
			this.ctx.fillStyle = "orange";
			for (let i in editUIs) {
				let e = editUIs[i];
				let x = e.getComponent("transform").pos.x;
				let y = e.getComponent("transform").pos.y;
				let sX = e.getComponent("boundingBox").size.x;
				let sY = e.getComponent("boundingBox").size.y;
				this.ctx.fillRect(x, y, sX, sY);
			}
			this.ctx.fillStyle = "#DE1212";
			this.ctx.font = "10px Arial";
			let sText = (this.pSpawnPointSet) ? "Finish Point" : "Spawn Point";
			this.ctx.fillText("Tile", this.tileUI.getComponent("transform").pos.x, this.tileUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Background", this.decUI.getComponent("transform").pos.x, this.decUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Enemy", this.enemyUI.getComponent("transform").pos.x, this.enemyUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Moving Enemy", this.mEnemyUI.getComponent("transform").pos.x, this.mEnemyUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText(sText, this.spawnUI.getComponent("transform").pos.x, this.spawnUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Delete", this.deleteUI.getComponent("transform").pos.x, this.deleteUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Save", this.saveUI.getComponent("transform").pos.x, this.saveUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Load", this.loadUI.getComponent("transform").pos.x, this.loadUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Snap to Grid", this.snapUI.getComponent("transform").pos.x, this.snapUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Moving Tile", this.mTileUI.getComponent("transform").pos.x, this.mTileUI.getComponent("transform").pos.y + 60);
			this.ctx.fillText("Instructions", this.instructionUI.getComponent("transform").pos.x, this.instructionUI.getComponent("transform").pos.y + 60);
		}
		// draw currently active asset at mouse pointer
		let x = this.editor.getComponent("mouse").current.x - 25;
		let y = this.editor.getComponent("mouse").current.y - 25;
		let sX = 50;
		let sY = 50;
		let aPos = (this.snapUI.getComponent("status").status) ? this.getSnapLocation(x, y) : { x: x, y: y };
		let img = assets.getTexture(1);
		if (this.editor.getComponent("state").state === "tile" || this.editor.getComponent("state").state === "mTile") {
			img = assets.getTexture(this.editor.getComponent("id").id);
			this.ctx.drawImage(img, aPos.x, aPos.y, sX, sY);
		}
		else if (this.editor.getComponent("state").state === "dec") {
			img = assets.getMap(this.editor.getComponent("id").id)
			sX = canvasWidth;
			sY = canvasHeight;
			this.ctx.drawImage(img, aPos.x, aPos.y, sX, sY);
		}
		else if (this.editor.getComponent("state").state === "enemy" || this.editor.getComponent("state").state === "mEnemy") {
			img = assets.getEnemy(this.editor.getComponent("id").id).idle[0];
			this.ctx.drawImage(img, aPos.x - 80, aPos.y - 60, 78 * 3, 49 * 3);
		}
		else if (this.editor.getComponent("state").state === "spawn") {
			if (!this.pSpawnPointSet) {
				img = assets.getPlayer("idle")[0];
				this.ctx.drawImage(img, 55, 85, 85, 25, aPos.x, aPos.y - 13, 255, 75);
			}
			else {
				img = assets.getFinish()[0];
				this.ctx.drawImage(img, aPos.x, aPos.y, 100, 200);
			}
		}
		// draw instructions if their display is toggled on
		if (this.instructionUI.getComponent("status").status) {
			this.ctx.font = "20px Arial";
			this.ctx.fillStyle = "black";
			this.ctx.fillRect(this.editor.getComponent("transform").pos.x, this.editor.getComponent("transform").pos.y + 70, 1000, 520);
			this.ctx.fillStyle = "white";
			this.ctx.fillText("- Click Tile/Background/Enemy to select an asset (shown at cursor position)", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 100);
			this.ctx.fillText("- Click the Delete box then click an asset on the map to delete it", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 140);
			this.ctx.fillText("- Click on Save to save your level and load to load a previously created level", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 180);
			this.ctx.fillText("- Click on snap to grid to toggle the snap to grid setting", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 220);
			this.ctx.fillText("- To place a moving tile/enemy, first click on the moving tile then click somewhere on the", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 260);
			this.ctx.fillText("  map to set the first position then another place to set the second position", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 300);
			this.ctx.fillText("- use the scroll wheel to change assets for each category (tiles, backgrounds, enemies, moving tiles)", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 340);
			this.ctx.fillText("- press the 'q' key to remove selected asset from cursor and press 'Esc' key to go back to the main menu", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 380);
			this.ctx.fillText("- press WASD keys to move around the map", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 420);
			this.ctx.fillText("- Click on instructions to toggle instructions display", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 460);
			this.ctx.fillText("- press the 'r' key to hide the UI", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 500);		
			this.ctx.fillText("- click spawn point, then on the map to set the position where the player will first spawn,", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 540);
			this.ctx.fillText("  then use finish point to set the position the player needs to reach to beat the level!", this.editor.getComponent("transform").pos.x + 30, this.editor.getComponent("transform").pos.y + 580);
		}
	}
}
class GameState_Play {
	constructor(canvas, wrapper, level) {
		this.entityManager = new EntityManager();
		this.player = this.entityManager.addEntity("player");
		this.can = canvas;
		this.canvas = canvas.getContext("2d");
		this.wrapper = wrapper;
		this.levelPath = level;
		this.spriteAnimCounter = 0;
		this.directionmod = 0;
		this.currentLevel = 0;
		this.bestRun = [];
		this.init();
	}
	// load level and spawn player
	init() {
		this.loadLevel(this.levelPath);
		this.spawnPlayer();
	}
	// load level entities / attach components depending on entity type
	// the parameter "level" is an array of all entities
	loadLevel(level) {
		let entities = level;
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
				let spawn = this.entityManager.addEntity("spawn");
				spawn.addComponent(new CTransform(e.pos.x, e.pos.y));
			}
			else if (e.type === "end") {
				let end = this.entityManager.addEntity("end");
				end.addComponent(new CTransform(e.pos.x, e.pos.y));
				end.addComponent(new CBoundingBox(80, 200))
				end.addComponent(new CAnimation(3, assets.getFinish(), true));
			}
		}
		// update entity manager with level
		this.entityManager.update();
	}
	// set up player entity with components
	spawnPlayer() {
		let pos = this.entityManager.getEntities("spawn")[0].getComponent("transform").pos;
		this.player.addComponent(new CTransform(pos.x, pos.y));
		this.player.addComponent(new CBoundingBox(45, 75));
		this.player.addComponent(new CInput());
		this.player.addComponent(new CStats(5, "player"));
		this.player.addComponent(new CGravity(2));
		this.player.addComponent(new CState("jumping"));
		this.player.addComponent(new CLifespan(1000));
		this.player.addComponent(new CInventory());
		this.player.addComponent(new CImmune(2000));
		this.player.addComponent(new CAnimation(6, assets.getPlayer("idle"), true));
	}
	// main game loop
	update() {
		// update entity manager
		this.entityManager.update();
		// run all systems (ordered)
		this.sUserInput();
		this.sEnemyAI();
		this.sMovement();
		this.sAnimation();
		this.sCollision();
		this.sLifespan();
		this.sRender();
	}
	// update animations depending on that particular entity's state
	sAnimation() {
		// update enemy animation
		let e = this.entityManager.getEntities("enemy");
		for (let i = 0; i < e.length; i++) {
			let num = e[i].getComponent("stats").type === "enemy1" ? 1 : 2;
			if (e[i].getComponent("state").state === "hit" && e[i].getComponent("state").prevState !== "hit") {
				e[i].getComponent("animation").fArray = assets.getEnemy(num).hit;
				e[i].getComponent("animation").fSpeed = 1;
				e[i].getComponent("animation").fIndex = 0;
				e[i].getComponent("animation").fCount = 0;
			}
			else if (e[i].getComponent("state").shooting && !e[i].getComponent("state").prevShot) {
				e[i].getComponent("animation").fArray = assets.getEnemy(num).attack;
				e[i].getComponent("animation").fSpeed = 3;
				e[i].getComponent("animation").fIndex = 0;
				e[i].getComponent("animation").fCount = 0;
			}
			else if (e[i].getComponent("state").doneShot) {
				e[i].getComponent("state").doneShot = false;
				if (e[i].hasComponent("movingTile")) {
					e[i].getComponent("animation").fArray = assets.getEnemy(num).run;
				}
				else {
					e[i].getComponent("animation").fArray = assets.getEnemy(num).idle;
				}
				e[i].getComponent("animation").fSpeed = 3;
				e[i].getComponent("animation").fIndex = 0;
				e[i].getComponent("animation").fCount = 0;
				e[i].getComponent("state").state = "normal";
			}
			e[i].getComponent("animation").fCount++;
			if (e[i].getComponent("animation").fCount >= e[i].getComponent("animation").fSpeed) {
				e[i].getComponent("animation").fCount = 0;
				let l = e[i].getComponent("animation").fArray.length;
				let index = e[i].getComponent("animation").fIndex;
				e[i].getComponent("animation").fIndex = (index < l - 1) ? index + 1 : 0;
				if (e[i].getComponent("state").shooting || e[i].getComponent("state").state === "hit" && index >= l - 1) {
					e[i].getComponent("state").shooting = false;
					e[i].getComponent("state").doneShot = true;
				}
			}
			e[i].getComponent("state").prevShot = e[i].getComponent("state").shooting;
			e[i].getComponent("state").prevState = e[i].getComponent("state").state;
		}
		// update end point animation 
		let end = this.entityManager.getEntities("end")[0].getComponent("animation");
		end.fCount++;
		if (end.fCount >= end.fSpeed) {
			end.fCount = 0;
			end.fIndex = (end.fIndex < end.fArray.length - 1) ? end.fIndex + 1 : 0;
		}
		// update player animation
		if (this.player.getComponent("state").shooting && !this.player.getComponent("state").prevShot) {
			if (this.player.getComponent("inv").currentWeapon === 1) {
				this.player.getComponent("animation").fArray = assets.getPlayer("attack1");
				this.player.getComponent("animation").fSpeed = 1;
				this.player.getComponent("animation").fIndex = 0;
				this.player.getComponent("animation").fCount = 0;
			}
			else if (this.player.getComponent("inv").currentWeapon === 2) {
				this.player.getComponent("animation").fArray = assets.getPlayer("attack3");
				this.player.getComponent("animation").fSpeed = 1;
				this.player.getComponent("animation").fIndex = 0;
				this.player.getComponent("animation").fCount = 0;
			}
		}
		else if (!this.player.getComponent("state").shooting && this.player.getComponent("state").prevState !== this.player.getComponent("state").state) {
			if (this.player.getComponent("state").state === "running") {
				this.player.getComponent("animation").fArray = assets.getPlayer("run");
				this.player.getComponent("animation").fSpeed = 3;
				this.player.getComponent("animation").fIndex = 0;
			}
			else {
				this.player.getComponent("animation").fArray = assets.getPlayer("idle")
				this.player.getComponent("animation").fSpeed = 6;
				this.player.getComponent("animation").fIndex = 0;
			}
		}
		else if (this.player.getComponent("state").doneShot) {
			this.player.getComponent("state").doneShot = false;
			this.player.getComponent("animation").fArray = assets.getPlayer("idle")
			this.player.getComponent("animation").fSpeed = 6;
			this.player.getComponent("animation").fIndex = 0;
		}
		this.player.getComponent("animation").fCount++;
		if (this.player.getComponent("animation").fCount >= this.player.getComponent("animation").fSpeed) {
			this.player.getComponent("animation").fCount = 0;
			let l = this.player.getComponent("animation").fArray.length;
			let i = this.player.getComponent("animation").fIndex;
			this.player.getComponent("animation").fIndex = (i < l - 1) ? i + 1 : 0;
			if (this.player.getComponent("state").shooting && i >= l - 1) {
				this.player.getComponent("state").shooting = false;
				this.player.getComponent("state").doneShot = true;
			}
		}
		this.player.getComponent("state").prevState = this.player.getComponent("state").state;
		this.player.getComponent("state").prevShot = this.player.getComponent("state").shooting;
	}
	// spawn a bullet from the player
	spawnBullet() {
		// weapon 1 bullet
		if (this.player.getComponent("inv").currentWeapon === 1) {
			if (this.player.getComponent("input").canShoot) {
				this.player.getComponent("input").canShoot = false;
				let pPos = this.player.getComponent("transform").pos;
				let dir = (this.player.getComponent("transform").facing.x > 0) ? 1 : -1;
				let bullet = this.entityManager.addEntity("bullet");
				bullet.addComponent(new CTransform(pPos.x, pPos.y + 20));
				bullet.getComponent("transform").size = { x: 50, y: 50 };
				bullet.getComponent("transform").speed = { x: 20 * dir, y: 0 };
				bullet.addComponent(new CBoundingBox(20, 20));
				bullet.addComponent(new CLifespan(1000));
				bullet.addComponent(new CDrawTime(230));
				bullet.addComponent(new CState("player"));
			}
		}
		// weapon 2 bullets
		else if (this.player.getComponent("inv").currentWeapon === 2) {
			if (this.player.getComponent("input").canShoot) {
				this.player.getComponent("input").canShoot = false;
				let pPos = this.player.getComponent("transform").pos;
				let dir = (this.player.getComponent("transform").facing.x > 0) ? 1 : -1;
				for (let i = -2; i < 2; i++) {
					let bullet = this.entityManager.addEntity("bullet");
					bullet.addComponent(new CTransform(pPos.x, pPos.y + 10));
					bullet.getComponent("transform").size = { x: 100, y: 100 };
					bullet.getComponent("transform").speed = { x: 20 * dir, y: i };
					bullet.addComponent(new CBoundingBox(50, 50));
					bullet.addComponent(new CLifespan(1000));
					bullet.addComponent(new CDrawTime(350));
					bullet.addComponent(new CState("player"));
				}
			}
		}
	}
	// spawn bullet from enemy 
	spawnEBullet(e) {
		let trans = e.getComponent("transform");
		// enemy 1 sword swing
		if (e.getComponent("stats").type === ("enemy1")) {
			let b = this.entityManager.addEntity("bullet")
			b.addComponent(new CTransform(trans.pos.x, trans.pos.y + 15));
			b.getComponent("transform").size = { x: 100, y: 50 };
			b.getComponent("transform").speed = { x: 10 * trans.facing.x, y: 0 };
			b.addComponent(new CBoundingBox(100, 50));
			b.addComponent(new CLifespan(550));
			b.addComponent(new CState(e.getComponent("stats").type));
			b.addComponent(new CDrawTime(100));
		}
		// enemy 2 fires bullet
		else {
			for (let i = -1; i < 1; i++) {
				let b = this.entityManager.addEntity("bullet")
				b.addComponent(new CTransform(trans.pos.x + i * 40, trans.pos.y + 25));
				b.getComponent("transform").size = { x: 50, y: 50 };
				b.getComponent("transform").speed = { x: 10 * trans.facing.x, y: 0 };
				b.addComponent(new CBoundingBox(50, 15));
				b.addComponent(new CLifespan(2500));
				b.addComponent(new CState(e.getComponent("stats").type));
				b.addComponent(new CDrawTime(1));
			}
		}
	}
	// enemy patrol and shoot at player if within range
	sEnemyAI() {
		let pPos = this.player.getComponent("transform").pos;
		let enemies = this.entityManager.getEntities("enemy");
		for (let i in enemies) {
			let e = enemies[i];
			let ePos = e.getComponent("transform").pos;
			let range = (e.getComponent("stats").type === "enemy1") ? 200 : 1500;
			// shoot at player if they're withing range
			if (e.getComponent("input").canShoot) {
				if (ePos.x - range <= pPos.x && ePos.x + range >= pPos.x && ePos.y - range <= pPos.y && ePos.y + range >= pPos.y) {
					e.getComponent("state").shooting = true;
					e.getComponent("input").canShoot = false;
					e.getComponent("lifespan").shotDelay = (e.getComponent("stats").type === "enemy1") ? 1200 : 100;
					e.getComponent("lifespan").sDStart = new Date().getTime();
				}
			}
			// enemy patrol
			if (e.hasComponent("movingTile")) {
				if (ePos.x >= e.getComponent("movingTile").p2) {
					e.getComponent("movingTile").speed = -e.getComponent("movingTile").speed;
					e.getComponent("transform").facing.x = -1;
				}
				else if (ePos.x < e.getComponent("movingTile").p1) {
					e.getComponent("movingTile").speed = -e.getComponent("movingTile").speed;
					e.getComponent("transform").facing.x = 1;
				}
				e.getComponent("transform").pos.x += e.getComponent("movingTile").speed;
			}
			else {
				e.getComponent("transform").facing.x = (ePos.x > pPos.x) ? -1 : 1;
			}
		}
	}
	// change things after a certain time has passed
	sLifespan() {
		let newTime = new Date().getTime();
		// player shooting
		let shootTime = newTime - this.player.getComponent("lifespan").start;
		if (shootTime >= this.player.getComponent("lifespan").time) {
			this.player.getComponent("lifespan").start = newTime;
			this.player.getComponent("input").canShoot = true;
		}
		// player immunity (after enemy collision)
		let hitTime = newTime - this.player.getComponent("immune").start;
		if (hitTime >= this.player.getComponent("immune").time) {
			this.player.getComponent("immune").start = newTime;
			this.player.getComponent("immune").isImmune = false;
		}
		// enemy shooting timeout, immunity and shot delay
		let e = this.entityManager.getEntities("enemy");
		for (let i in e) {
			shootTime = newTime - e[i].getComponent("lifespan").start;
			if (shootTime >= e[i].getComponent("lifespan").time) {
				e[i].getComponent("lifespan").start = newTime;
				e[i].getComponent("input").canShoot = true;
			}
			hitTime = newTime - e[i].getComponent("immune").start;
			if (hitTime >= e[i].getComponent("immune").time) {
				e[i].getComponent("immune").start = newTime;
				e[i].getComponent("immune").isImmune = false;
			}
			if (e[i].getComponent("lifespan").shotDelay > 0) {
				if (newTime - e[i].getComponent("lifespan").sDStart >= e[i].getComponent("lifespan").shotDelay) {
					this.spawnEBullet(e[i]);
					e[i].getComponent("lifespan").shotDelay = 0;
				}
			}
		}
		// bullet lifespan
		let b = this.entityManager.getEntities("bullet");
		for (let i = 0; i < b.length; i++) {
			let t = newTime - b[i].getComponent("lifespan").start
			if (t >= b[i].getComponent("lifespan").time) {
				b[i].destroy();
			}
		}
	}

	// get new positions of player, enemies and bullets
	sMovement() {
		let pPos = this.player.getComponent("transform").pos;
		let pSpeed = this.player.getComponent("transform").speed;
		// set player previous position
		this.player.getComponent("transform").prevPos = pPos;
		// set new game if player falls
		if (pPos.y >= 2000) {
			play = new GameState_Play(canvas, wrapper, this.levelPath);
		}
		// player movement y-direction
		if (this.player.getComponent("input").up === true && this.player.getComponent("state").state === "ground") {
			this.player.getComponent("state").state = "jumping";
			pSpeed.y -= 25;
		}
		if (this.player.getComponent("state").state === "jumping") {
			pSpeed.y += this.player.getComponent("gravity").gravity;
			pPos.y += pSpeed.y;
		}
		else {
			pSpeed.y = 0.0;
		}
		// player movement x-direction
		if (this.player.getComponent("input").right === true) {
			pPos.x += pSpeed.x;
			this.player.getComponent("state").state = "running";
		}
		if (this.player.getComponent("input").left === true) {
			pPos.x -= pSpeed.x;
			this.player.getComponent("state").state = "running";
		}
		// set max speed for the y direction
		let maxSpeed = 40.0;
		if (pSpeed.y > maxSpeed) {
			pSpeed.y = 10.0;
		}
		else if (pSpeed.y < -maxSpeed) {
			pSpeed.y = -10.0;
		}
		// update best run info
		this.bestRun.push({ x: this.player.getComponent("transform").pos.x, y: this.player.getComponent("transform").pos.y });
		// bullet movement
		if (this.player.getComponent("input").shoot === true && this.player.getComponent("input").canShoot === true) {
			this.player.getComponent("state").shooting = true;
			this.spawnBullet();
		}
		let bullets = this.entityManager.getEntities("bullet");
		for (let i = 0; i < bullets.length; i++) {
			bullets[i].getComponent("transform").pos.x += bullets[i].getComponent("transform").speed.x;
			bullets[i].getComponent("transform").pos.y += bullets[i].getComponent("transform").speed.y;
		}
		// tile movement
		let t = this.entityManager.getEntities("tile");
		let tileSpeed = 10;
		for (let i = 0; i < t.length; i++) {
			if (t[i].hasComponent("movingTile")) {
				if (t[i].getComponent("transform").pos.x >= t[i].getComponent("movingTile").p2) {
					t[i].getComponent("movingTile").speed = -t[i].getComponent("movingTile").speed;
				}
				else if (t[i].getComponent("transform").pos.x < t[i].getComponent("movingTile").p1) {
					t[i].getComponent("movingTile").speed = -t[i].getComponent("movingTile").speed;
				}
				t[i].getComponent("transform").pos.x += t[i].getComponent("movingTile").speed;
			}
		}
	}
	// detect if a collision is happening
	sCollision() {
		// detect player - tile collision
		let tiles = this.entityManager.getEntities("tile");
		let inAir = true;
		let pPos = this.player.getComponent("transform").pos;
		for (let i = 0; i < tiles.length; i++) {
			let tPos = tiles[i].getComponent("transform").pos;
			let overlap = Physics.getOverlap(this.player, tiles[i]);
			let previousOverlap = Physics.getPreviousOverlap(this.player, tiles[i]);
			// detect if player has gone through a tile and correct its position
			if (overlap.x > 0 && overlap.y > 0) {
				if (previousOverlap.x > 0 && pPos.y < tPos.y) {                         // top
					this.player.getComponent("transform").pos.y -= overlap.y;
				}
				else if (previousOverlap.x > 0 && pPos.y > tPos.y) {                    // bottom
					this.player.getComponent("transform").pos.y += overlap.y;
				}
				else if (previousOverlap.y > 0 && pPos.x > tPos.x) {                    // right
					this.player.getComponent("transform").pos.x += overlap.x;
				}
				else if (previousOverlap.y > 0 && pPos.x < tPos.x) {                    // left
					this.player.getComponent("transform").pos.x -= overlap.x;
				}
			}
			// detect if player is walking on a tile
			else if (overlap.y === 0 && overlap.x > 0 && previousOverlap.x > 0 && pPos.y < tPos.y) {
				inAir = false;
			}
		}
		this.player.getComponent("state").state = (inAir) ? "jumping" : "ground";

		let bullets = this.entityManager.getEntities("bullet");
		let enemies = this.entityManager.getEntities("enemy");
		for (let i = 0; i < bullets.length; i++) {
			// bullet - player collision
			if (bullets[i].getComponent("state").state === "enemy1" || bullets[i].getComponent("state").state === "enemy2") {
				let overlap = Physics.getOverlap(bullets[i], this.player);
				if (overlap.x > 0 && overlap.y > 0 && !this.player.getComponent("immune").isImmune) {
					bullets[i].destroy();
					if (this.player.getComponent("stats").hp <= 1) {
						play = new GameState_Play(canvas, wrapper, this.levelPath);
					}
					else {
						this.player.getComponent("stats").hp -= 1;
						this.player.getComponent("inv").score -= 5;
						this.player.getComponent("immune").isImmune = true;
					}
				}
			}
			for (let j = 0; j < enemies.length; j++) {
				// bullet - enemy collision
				if (bullets[i].getComponent("state").state === "player") {
					let overlap = Physics.getOverlap(bullets[i], enemies[j]);
					if (overlap.x > 0 && overlap.y > 0) {
						bullets[i].destroy();
						if (enemies[j].getComponent("stats").hp <= this.player.getComponent("stats").strength) {
							this.player.getComponent("inv").score += 10;
							enemies[j].destroy();
						}
						else {
							enemies[j].getComponent("stats").hp -= this.player.getComponent("stats").strength;
							enemies[j].getComponent("immune").isImmune = true;
							enemies[j].getComponent("state").state = "hit";
						}
					}
				}
			}
			// bullet - breakable tile collision
			for (let j in tiles) {
				let overlap = Physics.getOverlap(bullets[i], tiles[j]);
				if (overlap.x > 0 && overlap.y > 0) {
					if (tiles[j].hasComponent("stats")) {
						if (tiles[j].getComponent("stats").hp <= 1) {
							tiles[j].destroy();
						}
						else {
							tiles[j].getComponent("stats").hp -= 1;
						}
					}
					bullets[i].destroy();
				}
			}
		}
		// player - enemy collision
		for (let j in enemies) {
			let overlap = Physics.getOverlap(enemies[j], this.player);
			if (overlap.x > 0 && overlap.y > 0 && !this.player.getComponent("immune").isImmune) {
				if (this.player.getComponent("stats").hp <= 1) {
					play = new GameState_Play(canvas, wrapper, this.levelPath);
				}
				else {
					this.player.getComponent("stats").hp -= 1;
					this.player.getComponent("inv").score -= 5;
					this.player.getComponent("immune").isImmune = true;
					pPos.x = (pPos.x > enemies[j].getComponent("transform").pos.x) ? pPos.x + 60 : pPos.x - 60;
				}
			}
		}
		// player - food collision
		let food = this.entityManager.getEntities("food");
		for (let i in food) {
			let overlap = Physics.getOverlap(this.player, food[i]);
			if (overlap.x > 0 && overlap.y > 0) {
				food[i].destroy();
				this.player.getComponent("stats").hp += 1;
				this.player.getComponent("inv").score += 50;
			}
		}
		// player - end point collision
		let end = this.entityManager.getEntities("end")[0];
		let overlap = Physics.getOverlap(this.player, end);
		if (overlap.x > 0 && overlap.y > 0) {
			game.popState();
		}
	}

	// handle user input
	sUserInput() {
		let p = this.player;
		document.onkeydown = function (event) {
			if (event.keyCode === 68) { // d
				p.getComponent("input").right = true;
				p.getComponent("transform").facing.x = 1.0;
			}
			else if (event.keyCode === 83) { //s
				p.getComponent("input").down = true;
				p.getComponent("transform").facing.y = 1.0;
			}
			else if (event.keyCode === 65) { //a
				p.getComponent("input").left = true
				p.getComponent("transform").facing.x = -1.0;
			}
			else if (event.keyCode === 87) { //w
				p.getComponent("input").up = true;
				p.getComponent("transform").facing.y = -1.0;
			}
			else if (event.keyCode === 32) { //space bar
				p.getComponent("input").shoot = true;
			}
		}
		document.onkeyup = function (event) {
			if (event.keyCode === 68) { // d
				p.getComponent("input").right = false;
			}
			else if (event.keyCode === 83) { //s
				p.getComponent("input").down = false;
			}
			else if (event.keyCode === 65) { //a
				p.getComponent("input").left = false;
			}
			else if (event.keyCode === 87) { //w
				p.getComponent("input").up = false;
			}
			else if (event.keyCode === 32) { //space bar
				p.getComponent("input").shoot = false;
			}
			else if (event.keyCode === 27) { // esc
				p.getComponent("input").popState = true;
			}
			else if (event.keyCode === 81) {
				p.getComponent("inv").currentWeapon = (p.getComponent("inv").currentWeapon < p.getComponent("inv").weapons) ? p.getComponent("inv").currentWeapon + 1 : 1;
			}
		}
		if (p.getComponent("input").popState) {
			p.getComponent("input").popState = false;
			game.popState();
		}
	}
	// clear game area / draw next frame
	sRender() {
		// clear old frame
		let ps = this.player;
		let x = ps.getComponent("transform").pos.x;
		let y = ps.getComponent("transform").pos.y;
		let camX = x - 400;
		let camY = y - 250;
		this.wrapper.scrollLeft = camX;
		this.wrapper.scrollTop = camY;
		this.canvas.clearRect(0, 0, canvasWidth, canvasHeight);
		// draw all entities at their position given by CTransform
		let decs = this.entityManager.getEntities("dec");
		for (let i in decs) {
			let d = decs[i];
			let x = d.getComponent("transform").pos.x;
			let y = d.getComponent("transform").pos.y;
			let sX = d.getComponent("boundingBox").size.x;
			let sY = d.getComponent("boundingBox").size.y;
			let img = assets.getMap(d.getComponent("id").id);
			this.canvas.drawImage(img, x, y, sX, sY);;
		}
		let tiles = this.entityManager.getEntities("tile");
		for (let i in tiles) {
			let t = tiles[i];
			let x = t.getComponent("transform").pos.x;
			let y = t.getComponent("transform").pos.y;
			let sX = t.getComponent("boundingBox").size.x;
			let sY = t.getComponent("boundingBox").size.y;
			let img = assets.getTexture(t.getComponent("id").id);
			this.canvas.drawImage(img, x, y, sX, sY);
		}
		let enemies = this.entityManager.getEntities("enemy");
		for (let i in enemies) {
			let e = enemies[i];
			let eTrans = e.getComponent("transform");
			let eFA = e.getComponent("animation").fArray;
			let eFI = e.getComponent("animation").fIndex;
			if (e.getComponent("transform").facing.x === -1) {
				this.canvas.save();
				this.canvas.scale(-1, 1);
				this.canvas.drawImage(eFA[eFI], -eTrans.pos.x - 120, eTrans.pos.y - 60, eTrans.size.x * eTrans.scale.x, eTrans.size.y * eTrans.scale.y);
				this.canvas.restore();
			}
			else {
				this.canvas.drawImage(eFA[eFI], eTrans.pos.x - 80, eTrans.pos.y - 60, eTrans.size.x * eTrans.scale.x, eTrans.size.y * eTrans.scale.y);
			}
		}
		let food = this.entityManager.getEntities("food");
		for (let i in food) {
			let f = food[i];
			let pos = f.getComponent("transform").pos;
			let size = f.getComponent("boundingBox").size;
			let img = assets.getFood();
			this.canvas.drawImage(img, pos.x, pos.y, size.x, size.y);
		}
		// draw end point
		let ePos = this.entityManager.getEntities("end")[0].getComponent("transform").pos;
		let eAnim = this.entityManager.getEntities("end")[0].getComponent("animation");
		this.canvas.drawImage(eAnim.fArray[eAnim.fIndex], ePos.x, ePos.y, 100, 200);
		// draw UI
		this.canvas.font = "20px Impact";
		let t = new Date();
		let time = t - this.player.getComponent("immune").startTotalT;
		time /= 1000;
		time = Math.round(time);
		this.player.getComponent("immune").totalT = time;
		this.canvas.fillText("Time:" + time, this.wrapper.scrollLeft + 350, this.wrapper.scrollTop + 25);
		this.canvas.fillText("Weapon: " + this.player.getComponent("inv").currentWeapon, this.wrapper.scrollLeft + 500, this.wrapper.scrollTop + 25);
		this.canvas.fillText("Score: " + this.player.getComponent("inv").score, this.wrapper.scrollLeft + 650, this.wrapper.scrollTop + 25);		
		this.canvas.fillText("Health: " + this.player.getComponent("stats").hp, this.wrapper.scrollLeft + 800, this.wrapper.scrollTop + 25);
		let fI = this.player.getComponent("animation").fIndex;
		let fA = this.player.getComponent("animation").fArray;
		if (ps.getComponent("transform").facing.x === -1) {
			this.canvas.save();
			this.canvas.scale(-1, 1);
			this.canvas.drawImage(fA[fI], 55, 85, 85, 25, -x - 40, y - 13, 255, 75);
			this.canvas.restore();
		}
		else {
			this.canvas.drawImage(fA[fI], 55, 85, 85, 25, x, y - 13, 255, 75);
		}
		let b = this.entityManager.getEntities("bullet");
		let newTime = new Date().getTime();
		for (let i in b) {			
			if (b[i].getComponent("state").state !== "enemy1") {
				let bulletImg = (b[i].getComponent("state").state === "player") ? 1 : 2;
				let bPos = b[i].getComponent("transform").pos;
				let bSize = b[i].getComponent("transform").size;
				if (newTime - b[i].getComponent("lifespan").start >= b[i].getComponent("drawTime").time) {
					this.canvas.drawImage(assets.getBullet(bulletImg), bPos.x, bPos.y - 18, bSize.x, bSize.y);
				}
			}
		}
	}
}
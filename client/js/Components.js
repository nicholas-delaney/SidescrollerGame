class CTransform {
	constructor(x, y) {
		this.name = "transform";
		this.pos = { 
			x: x,
			y: y,
		};
		this.prevPos = {
			x: 0.0,
			y: 0.0
		};
		this.speed = {
			x: 10.0,
			y: 10.0
		};
		this.scale = {
			x: 1.0,
			y: 1.0
		};
		this.facing = {
			x: 1.0,
			y: 0.0
		};
		this.angle = 0.0;
	}
}
class CBoundingBox {
	constructor(sX, sY) {
		this.name = "boundingBox";
		this.size = {
			x: sX,
			y: sY
		}
		this.halfSize = {
			x: sX / 2,
			y: sY / 2
		}
	}
}
class CInventory {
	constructor() {
		this.name = "inv";
		this.weapons = 2;
		this.currentWeapon = 1;
		this.score = 0;
	}
}

class CImmune {
	constructor(time) {
		this.name = "immune";
		this.time = time;
		this.start = new Date().getTime();
		this.isImmune = true;
		this.startTotalT = new Date();
		this.totalT = 0;
	}
}
class CInput {
	constructor() {
		this.name = "input";
		this.up         = false;
		this.down       = false;
		this.left       = false;
		this.right      = false;
		this.space      = false;
		this.esc        = false;
		this.shoot      = false;
		this.canShoot   = true;
		this.popState   = false;
		this.pushGMenu  = false;
		this.pushEditor = false;
		this.pushGame   = false;
		this.immune = false;
	}
}
class CState {
	constructor(state) {
		this.name = "state";
		this.state = state;
		this.shooting = false;
		this.prevShot = false;
		this.prevState = "";
	}
}

class CGravity {
	constructor(gravity) {
		this.name = "gravity";
		this.gravity = gravity;
	}
}
class CStats {
	constructor(hp, type) {
		this.name = "stats";
		this.type = type;
		this.hp = hp;
		this.strength = 5;
		this.defence = 10;
		this.speed = 10;
		this.jump = 10;
	}
}

class CLifespan {
	constructor(time) {
		this.name = "lifespan";
		this.time = time;
		this.start = new Date().getTime();
		this.shotDelay = 0;
		this.sDStart = 0;
	}
}
class CMouse {
	constructor() {
		this.name = "mouse";
		this.coords = {
			x: 0,
			y: 0
		};
		this.current = {
			x: 0,
			y: 0
		};
		this.mouseClick = false;
	}
}
class CStatus {
	constructor(status) {
		this.name = "status";
		this.status = status;
	}
}
class CId {
	constructor(id) {
		this.name = "id";
		this.id = id;
	}
}
class CMovingTile {
	constructor(pos1, pos2) {
		this.name = "movingTile";
		this.speed = 2;
		this.p1 = pos1;
		this.p2 = pos2;
	}
}
class CAnimation {
	constructor(fSpeed, fArray, repeat) {
		this.name = "animation";
		this.fSpeed = fSpeed;
		this.fArray = fArray;
		this.repeat = repeat;
		this.fCount = 0;
		this.fIndex = 0;
	}
}
class CDrawTime {
	constructor(time) {
		this.name = "drawTime";
		this.time = time;
	}
}
class Physics {
	constructor() {}
	// get overlap between two entities in current frame
	static getOverlap(a, b) {
		let dX = this.abs(a.getComponent("transform").pos.x - b.getComponent("transform").pos.x);
		let oX = a.getComponent("boundingBox").halfSize.x + b.getComponent("boundingBox").halfSize.x - dX;
		let dY = this.abs(a.getComponent("transform").pos.y - b.getComponent("transform").pos.y);
		let oY = a.getComponent("boundingBox").halfSize.y + b.getComponent("boundingBox").halfSize.y - dY;
		return {x: oX, y: oY};
	}
	// get overlap between two entities in previous frame
	static getPreviousOverlap(a, b) {
		let dX = this.abs(a.getComponent("transform").prevPos.x - b.getComponent("transform").pos.x);
		let oX = a.getComponent("boundingBox").halfSize.x + b.getComponent("boundingBox").halfSize.x - dX;
		let dY = this.abs(a.getComponent("transform").prevPos.y - b.getComponent("transform").pos.y);
		let oY = a.getComponent("boundingBox").halfSize.y + b.getComponent("boundingBox").halfSize.y - dY;
		return {x: oX, y: oY};
	}
	// return absolute value of x
	static abs(x) {
		return x < 0 ? -x : x;
	}
}
// manage all entities in the game
class EntityManager {
	constructor() {
		this.entities = [];
		this.entityMap = {};
		this.entityMap["editUI"] = [];
		this.entityMap["player"] = [];
		this.entityMap["editor"] = [];
		this.entityMap["enemy"] = [];
		this.entityMap["tile"] = [];		
		this.entityMap["dec"] = [];
		this.entityMap["bullet"] = [];
		this.entityMap["spawn"] = [];
		this.entityMap["end"] = [];
		this.entityMap["menu"] = [];
		this.entityMap["food"] = [];
		this.entitiesToAdd = [];
		this.totalEntities = 0;
	}
	// remove deleted entities and add recently added entities
	update() {		
		// add entities from entitiesToAdd to entities and entityMap	
		for (let i = 0; i < this.entitiesToAdd.length; i++) {
			let e = this.entitiesToAdd[i];
			this.entities.push(e);
			this.entityMap[e.getTag()].push(e);
		}
		// clear entities to add array since they've been added
		this.entitiesToAdd = [];		
		// remove entities that are not active from entities and entityMap
		this.entities = this.entities.filter(entity => entity.isActive());
		
		let tags = Object.keys(this.entityMap);
		for (let i = 0; i < tags.length; i++) {
			this.entityMap[tags[i]] = this.entityMap[tags[i]].filter(entity => entity.isActive());
		}
	}
	// add an entity to be added on next update
	addEntity(tag) {
		let e = new Entity(this.totalEntities, tag);
		this.totalEntities++;
		this.entitiesToAdd.push(e);
		return e;
	}
	// get all entities
	getAllEntities() {
		return this.entities;
	}
	// get entites with specific tag
	getEntities(tag) {
		return this.entityMap[tag];
	}
}
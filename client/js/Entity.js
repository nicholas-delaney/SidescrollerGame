// entity object 
class Entity {
	constructor(id, tag) {
		this.id = id;
		this.tag = tag;
		this.active = true;
		this.components = {};
	}
	isActive() {
		return this.active;
	}
	// remove entity
	destroy() {
		this.active = false;
	}
	getTag() {
		return this.tag;
	}
	getId() {
		return this.id;
	}
	// returns true or false depending if entity has particular component
	hasComponent(componentName) {
		return this.components[componentName] != null;
	}
	// returns entities component
	getComponent(componentName) {
		return this.components[componentName];
	}
	// attach a component to the entity
	addComponent(component) {
		this.components[component.name] = component;
		return this;
	}
	// remove component from entity
	removeComponent(componentName) {
		delete this.components[componentName];
		return this;
	}
}
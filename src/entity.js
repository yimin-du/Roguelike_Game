import Tile from './tile';

export class Entity {
	constructor(name, x, y) {

		this.name = name || '';
		this.x = x || 0;
		this.y = y || 0;
		
	}
}

export class Player extends Entity {
	constructor(name, x, y, hp, hit, weapon) {
		super(name, x, y);
		this.hp = hp || 100;
		this.hit = hit || 30;
		this.weapon = weapon || new Weapon('weapon', 'dagger', 0, 0, 30, '&');
	}

	attack(target) {
		target.hp -= this.hit;
		this.hp -= target.hit;
	}

	
}


export class Enemy extends Entity {
	constructor(name, x, y, hp, hit, weapon) {
		super(name, x, y);

		this.hp = hp || 50;
		this.hit = hit || 40;
	}

}


export class Energy extends Entity {
	constructor(name, x, y, val) {
		super(name, x, y);

		this.val = val || 50;
	}
}

export class Weapon extends Entity {
	constructor(name, type, x, y, power, char) {
		super(name, x, y);
		this.type = type;
		this.char = char;
		this.power = power || 50;
	}
}



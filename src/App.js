import React, { Component } from 'react';
import Tile from './tile';
import GameMap from './map';
import { Player, Enemy, Energy, Weapon } from './entity';


const WIDTH = 100, HEIGHT = 35;
const SIGHT_RADIUS = 6;
const BACKGROUND = '#F0F3BD', FOREGROUND =  '#02C39A';
const PLAYER_COL = '#247BA0', ENEMY_COL = '#F25F5C', ENERGY_COL = '#00171F', WEAPON_COL = '#ED6A5A';
const weaponSet = [
	{type: 'dagger', power: 30, char: '&'},
	{type: 'axe', power: 40, char: '^'}, 
	{type: 'sword', power: 50, char: '%'}
];

let visibleTiles, torchMode = true;

let numEnemies = 10, numEnergies = 8, numWeapons = 5;
export default class App extends Component {

  constructor() {
  	super();
  
	this.display = new ROT.Display({width:WIDTH, height:HEIGHT});
	this.container = this.display.getContainer();
	document.body.appendChild(this.container);

	this.map = new GameMap(WIDTH, HEIGHT);

	// create player
	let pos = this.getStartPosition();
	let player = new Player("player", pos.x, pos.y);

	// create enemies
	let enemies = [];
	for(let i = 0; i < numEnemies; i++) {
		let pos = this.getStartPosition();
		let enemy = new Enemy("enemy", pos.x, pos.y);
		enemies.push(enemy);
	}

	// create energy blocks
	let energies = [];
	for(let i = 0; i < numEnergies; i++) {
		let pos = this.getStartPosition();
		let energy = new Energy("energy", pos.x, pos.y);
		energies.push(energy);
	}

	// create weapons
	let weapons = [];
	for(let i = 0; i < numEnergies; i++) {
		let weaponIndex = Math.floor(Math.random() * 3);
		let weapon = weaponSet[weaponIndex];

		let pos = this.getStartPosition();
		let newWeapon = new Weapon('weapon', weapon.type, pos.x, pos.y, weapon.power, weapon.char);
		weapons.push(newWeapon);
	}



	let _this = this;
	window.addEventListener('keydown', function(e) {
		_this.handleInput('keydown', e);
	});

	this.handleInput = this.handleInput.bind(this);

	let entities = [];
	entities.push(player);
	entities = entities.concat(enemies);
	entities = entities.concat(energies);
	entities = entities.concat(weapons);

	this.state = {
		player: player,
		enemies: enemies,
		entities: entities,
		energies: energies,
		weapons: weapons,
		message: "Exporing Dungen"
	};

	visibleTiles = new Map();
  }
  
  componentDidMount() {
  	this.drawMap();
  }

  blockLight() {
  	let x = this.state.player.x, y = this.state.player.y;

  	let FOV = new ROT.FOV.DiscreteShadowcasting(function(x, y) {
                    return torchMode;
                }, {topology: 4});

  	FOV.compute(x, y, SIGHT_RADIUS, function(x, y, r, visibility) {
  		visibleTiles.set(x+","+y, true);
  	});

  }

  
  getStartPosition() {
  	let x, y, ch;
  	do {
  		x = Math.floor(Math.random() * WIDTH);
  		y = Math.floor(Math.random() * HEIGHT);
  		ch = this.map[x][y].char;
  	} while( ch !== '.');

  	return { x: x, y: y};
  }

  getEntityAt(x, y) {
  	const entities = this.state.entities;
  	for(let i = 0; i < entities.length; i++) {
  		if(x === entities[i].x && y === entities[i].y) {
  			return entities[i];
  		}
  	}

  	return false;
  }

  move(moveX, moveY) {

  	// update currX and currY
  	let currX = this.state.player.x, currY = this.state.player.y;
  	let newX = moveX > 0 ? Math.min(currX + moveX, WIDTH - 1) : Math.max(currX + moveX, 0);
  	let newY = moveY > 0 ? Math.min(currY + moveY, HEIGHT - 1) : Math.max(currY + moveY, 0);

  	let entity = this.getEntityAt(newX, newY)
  	let player = this.state.player;

  	if(entity.name === 'enemy') {
  		player.attack(entity);

  		if(entity.hp <= 0) {
  			this.setState({message: "One more enemy died!"})
  			this.removeEntity(entity);
  		} 
  		if(player.hp <= 0) {
  			this.removeEntity(player);
  			this.gameOver("You lose!");
  		}
  		this.setState({ player });
  		return;
  	}

  	if(entity.name === 'energy') {
  		player.hp += entity.val;
  		this.setState({ player: player, message: "Health increase: +" + entity.val });
  		this.removeEntity(entity);
  		return;
  	}

  	if(entity.name === 'weapon') {
  		player.weapon = entity;
  		this.removeEntity(entity);

  		this.setState({ player: player, message: "Player picked up " + entity.type });

  		return;
  	}

  	player.x = newX;
  	player.y = newY;
  	this.setState({ player });
  	this.drawMap();
  }

  removeEntity(entity) {
  	let entities = this.state.entities;
  	for(let i = 0; i < entities.length; i++) {
  		if(entity.x === entities[i].x && entity.y === entities[i].y){
  			entities.splice(i, 1);
  			break;
  		}
  	}

  	this.setState({ entities });

  	let enemies = this.state.enemies;
  	if(entity.name === 'enemy') {
  		for(let i = 0; i < enemies.length; i++) {
  			if(entity.x === enemies[i].x && entity.y === enemies[i].y){
  				enemies.splice(i, 1);
  				numEnemies--;
  				break;
  			}
  		}
  		if(numEnemies <= 0) {
  			this.gameOver('You win! Explore next Dungen!');
  		}
  	}

  	this.setState({ enemies });
  	let energies = this.state.energies;

  	if(entity.name === 'energy') {
  		for(let i = 0; i < energies.length; i++) {
  			if(entity.x === energies[i].x && entity.y === energies[i].y){
  				energies.splice(i, 1);
  				numEnergies--;
  				break;
  			}
  		}
  	}
  	this.setState({ energies });

  	let weapons = this.state.weapons;

  	if(entity.name === 'weapon') {
  		for(let i = 0; i < weapons.length; i++) {
  			if(entity.x === weapons[i].x && entity.y === weapons[i].y){
  				weapons.splice(i, 1);
  				numWeapons--;
  				break;
  			}
  		}
  	}
  	this.setState({ weapons });


  	this.display.draw(entity.x, entity.y, '.', FOREGROUND, BACKGROUND);
  }

  gameOver(msg) {
  	this.setState( {message: "Game Over! " + msg});
  	window.alert("Game Over! " + msg);
  	console.log("game over!" + msg);

  	location.reload();
  }

  handleInput(type, data) {
  	if(type === 'keydown') {
  		switch(data.keyCode) {
  			case ROT.VK_LEFT:
  				this.move(-1, 0);
  				break;
  			case ROT.VK_RIGHT:
  				this.move(1, 0);
  				break;
			case ROT.VK_UP:
				this.move(0, -1);
				break;
			case ROT.VK_DOWN:
				this.move(0, 1);
				break;
  		}
  	}
  }

  drawMap() {

  	visibleTiles.clear();
  	if(torchMode)	this.blockLight();

  	let currX = this.state.player.x, currY = this.state.player.y;


  	if(this.map[currX][currY].char === '#') {
  		this.map[currX][currY] = Tile.getFloorTile();
  	}

  	for(let i = 0; i < WIDTH; i++) {
  		for(let j = 0; j < HEIGHT; j++) {
  			if(!visibleTiles.get(i+","+j) && torchMode){
  				this.display.draw(i, j, '', 'black', 'black');
  			} else {
  				let tile = this.map[i][j];
  				this.display.draw(i, j, tile.char, tile.foreCol, tile.backCol);
  			}	
  			
		}
  	}

  	// draw player
  	this.display.draw(currX, currY, '@', PLAYER_COL, BACKGROUND);

  	// draw enemies
  	for(let i = 0; i < numEnemies; i++) {
  		const enemy = this.state.enemies[i];
  		if(!visibleTiles.get(enemy.x+","+enemy.y) && torchMode){
  			this.display.draw(enemy.x, enemy.y, '', 'black', 'black');
  		} else {
  			this.display.draw(enemy.x, enemy.y, 'E', ENEMY_COL, BACKGROUND);
  		}
  	}

  	// draw energies
  	for(let i = 0; i < numEnergies; i++) {
  		const energy = this.state.energies[i];
  		if(!visibleTiles.get(energy.x+","+energy.y) && torchMode){
  			this.display.draw(energy.x, energy.y,'', 'black', 'black');
  		} else {
  			this.display.draw(energy.x, energy.y, '$', ENERGY_COL, BACKGROUND);
  		}
  	}

  	// draw weapons
  	for(let i = 0; i < numWeapons; i++) {
  		const weapon = this.state.weapons[i];
  		if(!visibleTiles.get(weapon.x+","+weapon.y) && torchMode){
  			this.display.draw(weapon.x, weapon.y, '', 'black', 'black');
  		} else {
  			this.display.draw(weapon.x, weapon.y, weapon.char, WEAPON_COL, BACKGROUND);
  		}
  	}


  }

  handleCheckedStatusChange(e) {
  	console.log("checked change");
  	torchMode = e.target.checked;

  	this.drawMap();

  }

  render() {
  	const player = this.state.player;
    return (
    	<div>
			<ul id="statusBar">
				<li id="health">Health: {player.hp}</li>
				<li id="weapon">Weapon: {player.weapon.type}</li>
				<li id="attack">Attack: {player.weapon.power}</li>
				<input id="torchMode" defaultChecked="true" type="checkbox" onClick={this.handleCheckedStatusChange.bind(this)} />Torch Mode
				<span id="message">{this.state.message}</span>
			</ul>		
    	</div>
    );
  }
}



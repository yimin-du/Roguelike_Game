import React, { Component } from 'react';

export default class Tile extends Component {
	constructor(char, foreCol, backCol) {
		super();
		this.char = char || '';
		this.foreCol = foreCol || '#02C39A';
		this.backCol = backCol || '#F0F3BD';

	}

	static getNullTile() {
		return new Tile();
	}

	static getFloorTile() {
		return new Tile('.');
	}

	static getWallTile() {
		return new Tile('#');
	}

	isWalkable() {
		return this.char === '.';
	}
}
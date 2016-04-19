import React, { Component } from 'react';
import Tile from './tile';

export default class GameMap extends Component {
	constructor(width, height) {
		super();
		this.width = width;
		this.height = height;

		const nullTile = new Tile();
		const floorTile = new Tile('.');
		const wallTile = new Tile('#');

		this.nullTile = nullTile;
		this.floorTile = floorTile;
		this.wallTile = wallTile;

		let map = [];	// map is an 2d array of tiles
		for(let x = 0; x < this.width; x++) {
			map.push([]);
			for(let y = 0; y < this.height; y++) {
				map[x].push(nullTile);
			}
		}

		let generator = new ROT.Map.Cellular(this.width, this.height);
		generator.randomize(0.5);
		let numIter = 3;

		for (let i = 0; i < numIter - 1; i++) {
        	generator.create();
        }

        generator.create(function(x,y,v) {
                if (v === 1) {
                    map[x][y] = floorTile;
                } else {
                    map[x][y] = wallTile;
                }
        });

  		// another map style
  		// var generator = new ROT.Map.Uniform(width, height, 
  		//     {timeLimit: 5000});
  		// generator.create(function(x,y,v) {
  		//     if (v === 0) {
  		//         map[x][y] = floorTile;
  		//     } else {
  		//         map[x][y] = wallTile;
  		//     }
  		// });


        return map;
	}

	getTile(x, y) {

	    if (x < 0 || x >= this.width || y < 0 || y >= this._height) {
	        return Tile.nullTile;
	    } else {
	        return this.data[x][y] || Tile.nullTile;
	    }
	}

	getMap() {
		
    }

}
const http = require('http');
const Pokemon = require('../src/models/Pokemon');
const Database = require('../src/database/Database');

const pokemonList = [
	{ name: 'Bulbasaur', type: 'Grass' },
	{ name: 'Charmander', type: 'Fire' },
	{ name: 'Squirtle', type: 'Water' },
	{ name: 'Pikachu', type: 'Lightning' },
	{ name: 'Pidgeotto', type: 'Flying' },
	{ name: 'Koffing', type: 'Poison' },
	{ name: 'Dragonite', type: 'Dragon' },
	{ name: 'Machamp', type: 'Fighting' },
	{ name: 'Clefairy', type: 'Fairy' },
	{ name: 'Eevee', type: 'Normal' },
	{ name: 'Sandslash', type: 'Ground' },
	{ name: 'Vulpix', type: 'Fire' },
	{ name: 'Alakazam', type: 'Psychic' },
	{ name: 'Onyx', type: 'Rock' },
	{ name: 'Hitmonlee', type: 'Fighting' },
	{ name: 'Snorlax', type: 'Normal' },
];

class TestHelper {
	/** Since a Pokemon can only be added to the DB once,
	 * we have to splice from the array.
	 */
	static generatePokemonData(name = null, type = null) {
		const pokemonData = pokemonList.splice(Math.floor((Math.random() * pokemonList.length)), 1)[0];

		return {
			name: name ?? pokemonData.name,
			type: type ?? pokemonData.type,
		};
	}

	static async generatePokemon(name = null, type = null) {
		const pokemonData = TestHelper.generatePokemonData(name, type);
		const pokemon = await Pokemon.create(pokemonData.name, pokemonData.type);

		return pokemon;
	}

	static generateRandomId(existingId = 1) {
		let id = Math.floor(Math.random() * 100) + 1;

		while (id === existingId) {
			id = Math.floor(Math.random() * 100) + 1;
		}

		return id;
	}

	static async makeHttpRequest(method, path, data = {}) {
		const options = {
			host: 'localhost',
			port: 8000,
			path,
			method,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'Content-Length': Buffer.byteLength(JSON.stringify(data)),
			},
		};

		return new Promise((resolve, reject) => {
			let body = '';
			const request = http.request(options, (response) => {
				response.on('data', (chunk) => {
					body += chunk;
				});
				response.on('end', () => resolve([response.statusCode, JSON.parse(body)]));
			});

			request.on('error', (err) => reject(err));
			request.write(JSON.stringify(data));
			request.end();
		});
	}

	static async truncateDatabase(tables = [], autoIncrementStart = 1) {
		if (tables.length === 0) {
			await Database.truncate([
				'pokemon',
			]);

			return;
		}

		await Database.truncate(tables, autoIncrementStart);
	}
}

module.exports = TestHelper;

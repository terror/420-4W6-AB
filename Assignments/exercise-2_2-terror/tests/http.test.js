const http = require('http');
const Pokemon = require('../src/models/Pokemon');
const Database = require('../src/database/Database');

const pokemonData = [
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

/** Since a Pokemon can only be added to the DB once, we have to splice from the array. */
const generatePokemonData = () => pokemonData.splice(Math.floor((Math.random() * pokemonData.length)), 1)[0];

const makeHttpRequest = (method, path, data = {}) => {
	const options = {
		host: 'localhost',
		port: 8000,
		path,
		method,
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(JSON.stringify(data)),
		},
	};

	return new Promise((resolve, reject) => {
		let body = '';
		const request = http.request(options, (response) => {
			response.on('data', (chunk) => {
				body += chunk;
			});
			response.on('end', () => resolve(JSON.parse(body)));
		});

		request.on('error', (err) => reject(err));
		request.write(JSON.stringify(data));
		request.end();
	});
};

test('Pokemon was created successfully.', async () => {
	const { name, type } = generatePokemonData();
	const response = await makeHttpRequest('POST', '/pokemon', { name, type });

	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.message).toBe('Pokemon created successfully!');
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(name);
	expect(response.payload.type).toBe(type);
});

test('All Pokemon were found.', async () => {
	const { name: name1, type: type1 } = generatePokemonData();
	const { name: name2, type: type2 } = generatePokemonData();
	const { name: name3, type: type3 } = generatePokemonData();

	await Pokemon.create(name1, type1);
	await Pokemon.create(name2, type2);
	await Pokemon.create(name3, type3);

	const response = await makeHttpRequest('GET', `/pokemon`);

	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(Array.isArray(response.payload)).toBe(true);
	expect(response.payload.length).toBe(3);
	expect(response.message).toBe('Pokemon retrieved successfully!');
	expect(response.payload[0].id).toBe(1);
	expect(response.payload[0].name).toBe(name1);
	expect(response.payload[0].type).toBe(type1);
	expect(response.payload[1].id).toBe(2);
	expect(response.payload[1].name).toBe(name2);
	expect(response.payload[1].type).toBe(type2);
	expect(response.payload[2].id).toBe(3);
	expect(response.payload[2].name).toBe(name3);
	expect(response.payload[2].type).toBe(type3);
});

test('Pokemon was found by ID.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);
	const response = await makeHttpRequest('GET', `/pokemon/${pokemon.getId()}`);

	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.message).toBe('Pokemon retrieved successfully!');
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(name);
	expect(response.payload.type).toBe(type);
});

test('Pokemon was updated successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);
	const { name: newName } = generatePokemonData();
	let response = await makeHttpRequest('PUT', `/pokemon/${pokemon.getId()}`, { name: newName });

	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.message).toBe('Pokemon updated successfully!');
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(newName);
	expect(response.payload.type).toBe(type);
	expect(response.payload.username).not.toBe(name);

	response = await makeHttpRequest('GET', `/pokemon/${pokemon.getId()}`);

	expect(response.payload.name).toBe(newName);
	expect(response.payload.type).toBe(type);
});

test('Pokemon was deleted successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);
	let response = await makeHttpRequest('DELETE', `/pokemon/${pokemon.getId()}`);

	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.message).toBe('Pokemon deleted successfully!');
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(name);
	expect(response.payload.type).toBe(type);

	response = await makeHttpRequest('GET', `/pokemon/${pokemon.getId()}`);

	expect(response.message).toBe('Could not retrieve Pokemon.');
	expect(response.payload).toMatchObject({});
});

afterEach(async () => {
	const connection = await Database.connect();
	const tables = ['pokemon'];

	try {
		await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

		tables.forEach(async (table) => {
			await connection.execute(`DELETE FROM ${table}`);
			await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
		});

		await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
	}
	catch (exception) {
		console.log(exception.sqlMessage);
	}
	finally {
		await connection.end();
	}
});

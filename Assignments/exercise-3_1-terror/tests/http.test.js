const Pokemon = require('../src/models/Pokemon');
const {
	makeHttpRequest,
	generatePokemonData,
	truncateDatabase,
	generatePokemon,
	generateRandomId,
} = require('./TestHelper');

test('Homepage was retrieved successfully.', async () => {
	const [statusCode, response] = await makeHttpRequest('GET', '/');

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Homepage!');
	expect(response.payload).toMatchObject({});
});

test('Invalid path returned error.', async () => {
	const [statusCode, response] = await makeHttpRequest('GET', '/digimon');

	expect(statusCode).toBe(404);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Invalid request path!');
	expect(response.payload).toMatchObject({});
});

test('Invalid request method returned error.', async () => {
	const [statusCode, response] = await makeHttpRequest('PATCH', '/pokemon');

	expect(statusCode).toBe(405);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Invalid request method!');
	expect(response.payload).toMatchObject({});
});

test('Pokemon was created successfully.', async () => {
	const pokemonData = generatePokemonData();
	const [statusCode, response] = await makeHttpRequest('POST', '/pokemon', pokemonData);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Pokemon created successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(pokemonData.name);
	expect(response.payload.type).toBe(pokemonData.type);
});

test('Pokemon not created with blank name.', async () => {
	const pokemonData = await generatePokemonData('');
	const [statusCode, response] = await makeHttpRequest('POST', '/pokemon', pokemonData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Cannot create Pokemon: Missing name.');
	expect(response.payload).toMatchObject({});
});

test('Pokemon not created with blank type.', async () => {
	const pokemonData = await generatePokemonData(null, '');
	const [statusCode, response] = await makeHttpRequest('POST', '/pokemon', pokemonData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Cannot create Pokemon: Missing type.');
	expect(response.payload).toMatchObject({});
});

test('Pokemon not created with duplicate name.', async () => {
	const pokemon = await generatePokemon();
	const pokemonData = await generatePokemonData(pokemon.getName());
	const [statusCode, response] = await makeHttpRequest('POST', '/pokemon', pokemonData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Cannot create Pokemon: Duplicate name.');
	expect(response.payload).toMatchObject({});
});

test('All Pokemon were found.', async () => {
	const pokemonList = [
		await generatePokemon(),
		await generatePokemon(),
		await generatePokemon(),
	];
	const [statusCode, response] = await makeHttpRequest('GET', '/pokemon');

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Pokemon retrieved successfully!');
	expect(Array.isArray(response.payload)).toBe(true);
	expect(response.payload.length).toBe(3);

	response.payload.forEach((pokemon, index) => {
		expect(Object.keys(pokemon).includes('id')).toBe(true);
		expect(Object.keys(pokemon).includes('name')).toBe(true);
		expect(Object.keys(pokemon).includes('type')).toBe(true);
		expect(pokemon.id).toBe(pokemonList[index].getId());
		expect(pokemon.name).toBe(pokemonList[index].getName());
		expect(pokemon.type).toBe(pokemonList[index].getType());
	});
});

test('Pokemon was found by ID.', async () => {
	const pokemon = await generatePokemon();
	const [statusCode, response] = await makeHttpRequest('GET', `/pokemon/${pokemon.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Pokemon retrieved successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(pokemon.getName());
	expect(response.payload.type).toBe(pokemon.getType());
});

test('Pokemon not found by wrong ID.', async () => {
	const pokemonId = generateRandomId();
	const [statusCode, response] = await makeHttpRequest('GET', `/pokemon/${pokemonId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot retrieve Pokemon: Pokemon does not exist with ID ${pokemonId}.`);
	expect(response.payload).toMatchObject({});
});

test('Pokemon was updated successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);
	const { name: newName } = generatePokemonData();
	let [statusCode, response] = await makeHttpRequest('PUT', `/pokemon/${pokemon.getId()}`, { name: newName });

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Pokemon updated successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(newName);
	expect(response.payload.type).toBe(type);
	expect(response.payload.name).not.toBe(name);

	[statusCode, response] = await makeHttpRequest('GET', `/pokemon/${pokemon.getId()}`);

	expect(response.payload.name).toBe(newName);
	expect(response.payload.type).toBe(type);
});

test('Pokemon not updated with non-existant ID.', async () => {
	const pokemonId = generateRandomId();
	const [statusCode, response] = await makeHttpRequest('PUT', `/pokemon/${pokemonId}`, { name: 'Charmander' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot update Pokemon: Pokemon does not exist with ID ${pokemonId}.`);
	expect(response.payload).toMatchObject({});
});

test('Pokemon not updated with blank name.', async () => {
	const pokemon = await generatePokemon();
	const [statusCode, response] = await makeHttpRequest('PUT', `/pokemon/${pokemon.getId()}`, { name: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Cannot update Pokemon: No update parameters were provided.');
	expect(response.payload).toMatchObject({});
});

test('Pokemon not updated with blank type.', async () => {
	const pokemon = await generatePokemon();
	const [statusCode, response] = await makeHttpRequest('PUT', `/pokemon/${pokemon.getId()}`, { type: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Cannot update Pokemon: No update parameters were provided.');
	expect(response.payload).toMatchObject({});
});

test('Pokemon was deleted successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);
	let [statusCode, response] = await makeHttpRequest('DELETE', `/pokemon/${pokemon.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Pokemon deleted successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('name')).toBe(true);
	expect(Object.keys(response.payload).includes('type')).toBe(true);
	expect(response.payload.id).toBe(1);
	expect(response.payload.name).toBe(name);
	expect(response.payload.type).toBe(type);

	[statusCode, response] = await makeHttpRequest('GET', `/pokemon/${pokemon.getId()}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot retrieve Pokemon: Pokemon does not exist with ID ${pokemon.getId()}.`);
	expect(response.payload).toMatchObject({});
});

test('Pokemon not deleted with non-existant ID.', async () => {
	const pokemonId = generateRandomId();
	const [statusCode, response] = await makeHttpRequest('DELETE', `/pokemon/${pokemonId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot delete Pokemon: Pokemon does not exist with ID ${pokemonId}.`);
	expect(response.payload).toMatchObject({});
});

afterEach(async () => {
	await truncateDatabase();
});

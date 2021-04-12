const Router = require('../src/router/Router');
const Response = require('../src/router/Response');
const Request = require('../src/router/Request');
const Pokemon = require('../src/models/Pokemon');
const logger = require('../src/helpers/Logger');
const {
	generatePokemon,
	generatePokemonData,
	generateRandomId,
	truncateDatabase,
} = require('./TestHelper');

let initialPokemonId;

logger.toggleConsoleLog(false);

beforeEach(async () => {
	initialPokemonId = generateRandomId();
	await truncateDatabase(['pokemon'], initialPokemonId);
});

test('Homepage was retrieved successfully.', async () => {
	const request = new Request('GET', '/');
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Homepage!');
	expect(response.getPayload()).toMatchObject({});
});

test('Invalid path returned error.', async () => {
	const request = new Request('GET', '/digimon');
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(404);
	expect(response.getMessage()).toBe('Invalid request path!');
	expect(response.getPayload()).toMatchObject({});
});

test('Invalid request method returned error.', async () => {
	const request = new Request('PATCH', '/pokemon');
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(405);
	expect(response.getMessage()).toBe('Invalid request method!');
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon created successfully.', async () => {
	const pokemonData = generatePokemonData();
	const request = new Request('POST', '/pokemon', pokemonData);
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(initialPokemonId);
	expect(response.getPayload().getName()).toBe(pokemonData.name);
	expect(response.getPayload().getType()).toBe(pokemonData.type);
});

test('Pokemon not created with blank name.', async () => {
	const pokemonData = await generatePokemonData('');
	const request = new Request('POST', '/pokemon', pokemonData);
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Pokemon: Missing name.');
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon not created with blank type.', async () => {
	const pokemonData = await generatePokemonData(null, '');
	const request = new Request('POST', '/pokemon', pokemonData);
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Pokemon: Missing type.');
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon not created with duplicate name.', async () => {
	const pokemon = await generatePokemon();
	const pokemonData = await generatePokemonData(pokemon.getName());
	const request = new Request('POST', '/pokemon', pokemonData);
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Pokemon: Duplicate name.');
	expect(response.getPayload()).toMatchObject({});
});

test('All Pokemon found.', async () => {
	const pokemonList = [
		await generatePokemon(),
		await generatePokemon(),
		await generatePokemon(),
	];
	const request = new Request('GET', '/pokemon');
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(Array.isArray(response.getPayload())).toBe(true);
	expect(response.getPayload().length).toBe(pokemonList.length);

	response.getPayload().forEach((pokemon, index) => {
		expect(pokemon).toBeInstanceOf(Pokemon);
		expect(pokemon.getId()).toBe(pokemonList[index].getId());
		expect(pokemon.getName()).toBe(pokemonList[index].getName());
		expect(pokemon.getType()).toBe(pokemonList[index].getType());
	});
});

test('Pokemon found by ID.', async () => {
	const pokemon = await generatePokemon();
	const request = new Request('GET', `/pokemon/${pokemon.getId()}`);
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(Object.keys(response.getPayload()).includes('id')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('name')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('type')).toBe(true);
	expect(response.getPayload().getId()).toBe(pokemon.getId());
	expect(response.getPayload().getName()).toBe(pokemon.getName());
	expect(response.getPayload().getType()).toBe(pokemon.getType());
});

test('Pokemon not found by wrong ID.', async () => {
	const pokemonId = generateRandomId();
	const request = new Request('GET', `/pokemon/${pokemonId}`);
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot retrieve Pokemon: Pokemon does not exist with ID ${pokemonId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon updated successfully.', async () => {
	const pokemon = await generatePokemon();
	const newPokemonData = generatePokemonData();
	let request = new Request('PUT', `/pokemon/${pokemon.getId()}`, newPokemonData);
	let router = new Router(request, new Response());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon updated successfully!');
	expect(response.getPayload().getId()).toBe(pokemon.getId());
	expect(response.getPayload().getName()).toBe(newPokemonData.name);
	expect(response.getPayload().getType()).toBe(newPokemonData.type);
	expect(response.getPayload().getName()).not.toBe(pokemon.name);

	request = new Request('GET', `/pokemon/${pokemon.getId()}`);
	router = new Router(request, new Response());
	response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getName()).toBe(newPokemonData.name);
	expect(response.getPayload().getType()).toBe(newPokemonData.type);
});

test('Pokemon not updated with non-existant ID.', async () => {
	const pokemonId = generateRandomId();
	const request = new Request('PUT', `/pokemon/${pokemonId}`, { name: 'NewName' });
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot update Pokemon: Pokemon does not exist with ID ${pokemonId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon not updated with blank name.', async () => {
	const pokemon = await generatePokemon();
	const request = new Request('PUT', `/pokemon/${pokemon.getId()}`, { name: '' });
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update Pokemon: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon not updated with blank type.', async () => {
	const pokemon = await generatePokemon();
	const request = new Request('PUT', `/pokemon/${pokemon.getId()}`, { type: '' });
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update Pokemon: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon deleted successfully.', async () => {
	const pokemon = await generatePokemon();
	let request = new Request('DELETE', `/pokemon/${pokemon.getId()}`);
	let router = new Router(request, new Response());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon deleted successfully!');
	expect(Object.keys(response.getPayload()).includes('id')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('name')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('type')).toBe(true);
	expect(response.getPayload().getId()).toBe(pokemon.getId());
	expect(response.getPayload().getName()).toBe(pokemon.getName());
	expect(response.getPayload().getType()).toBe(pokemon.getType());

	request = new Request('GET', `/pokemon/${pokemon.getId()}`);
	router = new Router(request, new Response());
	response = await router.dispatch();

	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot retrieve Pokemon: Pokemon does not exist with ID ${pokemon.getId()}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Pokemon not deleted with non-existant ID.', async () => {
	const pokemonId = generateRandomId();
	const request = new Request('DELETE', `/pokemon/${pokemonId}`);
	const router = new Router(request, new Response());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot delete Pokemon: Pokemon does not exist with ID ${pokemonId}.`);
	expect(response.getPayload()).toMatchObject({});
});

afterEach(async () => {
	await truncateDatabase();
});

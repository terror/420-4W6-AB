const Pokemon = require('../src/models/Pokemon');
const PokemonController = require('../src/controllers/PokemonController');
const Response = require('../src/router/Response');
const Request = require('../src/router/Request');
const logger = require('../src/helpers/Logger');
const {
	generatePokemonData,
	generatePokemon,
	generateRandomId,
	truncateDatabase,
} = require('./TestHelper');

logger.toggleConsoleLog(false);

test('PokemonController handled a POST request.', async () => {
	const pokemonData = generatePokemonData();
	const request = new Request('POST', '/pokemon', pokemonData);
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe(pokemonData.name);
	expect(response.getPayload().getType()).toBe(pokemonData.type);
});

test('PokemonController threw an exception handling a POST request with blank name.', async () => {
	const pokemonData = generatePokemonData('');
	const request = new Request('POST', '/pokemon', pokemonData);
	const controller = new PokemonController(request, new Response());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot create Pokemon: Missing name.',
	});
});

test('PokemonController threw an exception handling a POST request with blank type.', async () => {
	const pokemonData = generatePokemonData(null, '');
	const request = new Request('POST', '/pokemon', pokemonData);
	const controller = new PokemonController(request, new Response());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot create Pokemon: Missing type.',
	});
});

test('PokemonController threw an exception handling a POST request with duplicate name.', async () => {
	const pokemon = await generatePokemon();
	const pokemonData = generatePokemonData(pokemon.getName());
	const request = new Request('POST', '/pokemon', pokemonData);
	const controller = new PokemonController(request, new Response());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot create Pokemon: Duplicate name.',
	});
});

test('PokemonController threw an exception handling a GET (all) request with no Pokemon in database.', async () => {
	const request = new Request('GET', '/pokemon');
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(Array.isArray(response.getPayload()));
	expect(response.getPayload().length).toBe(0);
});

test('PokemonController handled a GET (all) request with 3 Pokemon in database.', async () => {
	await generatePokemon();
	await generatePokemon();
	await generatePokemon();

	const request = new Request('GET', '/pokemon');
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(Array.isArray(response.getPayload())).toBe(true);
	expect(response.getPayload().length).toBe(3);
	expect(response.getPayload()[0]).toBeInstanceOf(Pokemon);
	expect(response.getPayload()[1]).toBeInstanceOf(Pokemon);
	expect(response.getPayload()[2]).toBeInstanceOf(Pokemon);
});

test('PokemonController handled a GET (one) request.', async () => {
	const pokemon = await generatePokemon();
	const request = new Request('GET', `/pokemon/${pokemon.getId()}`);
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(pokemon.getId());
	expect(response.getPayload().getName()).toBe(pokemon.getName());
	expect(response.getPayload().getType()).toBe(pokemon.getType());
});

test('PokemonController threw an exception handling a GET request with non-existant ID.', async () => {
	const pokemonId = generateRandomId();
	const request = new Request('GET', `/pokemon/${pokemonId}`);
	const controller = new PokemonController(request, new Response());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'PokemonException',
		message: `Cannot retrieve Pokemon: Pokemon does not exist with ID ${pokemonId}.`,
	});
});

test('PokemonController handled a PUT request.', async () => {
	const pokemon = await generatePokemon();
	const newPokemonData = generatePokemonData();
	const request = new Request('PUT', `/pokemon/${pokemon.getId()}`, newPokemonData);
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon updated successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(pokemon.getId());
	expect(response.getPayload().getName()).toBe(newPokemonData.name);
	expect(response.getPayload().getType()).toBe(newPokemonData.type);
	expect(response.getPayload().getName()).not.toBe(pokemon.getName());
	expect(response.getPayload().getType()).not.toBe(pokemon.getType());
});

test('PokemonController threw an exception handling a PUT request with non-existant ID.', async () => {
	const pokemonId = generateRandomId();
	const request = new Request('PUT', `/pokemon/${pokemonId}`, { name: 'Charmander' });
	const controller = new PokemonController(request, new Response());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'PokemonException',
		message: `Cannot update Pokemon: Pokemon does not exist with ID ${pokemonId}.`,
	});
});

test('PokemonController threw an exception handling a PUT request with no update fields.', async () => {
	const pokemon = await generatePokemon();
	const request = new Request('PUT', `/pokemon/${pokemon.getId()}`, { name: '', type: '' });
	const controller = new PokemonController(request, new Response());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot update Pokemon: No update parameters were provided.',
	});
});

test('PokemonController handled a DELETE request.', async () => {
	const pokemon = await generatePokemon();
	const request = new Request('DELETE', `/pokemon/${pokemon.getId()}`);
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon deleted successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(pokemon.getId());
	expect(response.getPayload().getName()).toBe(pokemon.getName());
	expect(response.getPayload().getType()).toBe(pokemon.getType());
});

test('PokemonController threw an exception handling a DELETE request with non-existant ID.', async () => {
	const pokemonId = generateRandomId();
	const request = new Request('DELETE', `/pokemon/${pokemonId}`);
	const controller = new PokemonController(request, new Response());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'PokemonException',
		message: `Cannot delete Pokemon: Pokemon does not exist with ID ${pokemonId}.`,
	});
});

afterEach(async () => {
	await truncateDatabase();
});

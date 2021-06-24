/**
 * This test suite is a bit ridiculous and would never be seen in the real world.
 * You would never actually test each function and variable of every class to see
 * if they exist and are the correct types. This granular test case can be thought
 * of as "specs" to help you write the classes for the exercise.
 */

const Router = require('../src/router/Router');
const Response = require('../src/router/Response');
const Request = require('../src/router/Request');
const Pokemon = require('../src/models/Pokemon');
const Database = require('../src/database/Database');

test('Router class has the correct variables and functions.', () => {
	const router = new Router(new Request(), new Response());

	// Variables
	expect(Reflect.has(router, 'request')).toBe(true);
	expect(Reflect.has(router, 'response')).toBe(true);

	// Functions
	expect(Reflect.has(router, 'constructor')).toBe(true);
	expect(Reflect.has(router, 'dispatch')).toBe(true);
});

test('Router dispatched Homepage.', async () => {
	const router = new Router(new Request('GET', '/', {}), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Homepage!');
	expect(response.getPayload()).toMatchObject({});
});

test('Router dispatched invalid path.', async () => {
	const router = new Router(new Request('GET', '/digimon', {}), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(404);
	expect(response.getMessage()).toBe('Invalid URL!');
	expect(response.getPayload()).toMatchObject({});
});

test('Router dispatched GET /pokemon with no Pokemon in database.', async () => {
	const router = new Router(new Request('GET', '/pokemon', {}), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(Array.isArray(response.getPayload()));
	expect(response.getPayload().length).toBe(0);
});

test('Router dispatched GET /pokemon with 3 Pokemon in database.', async () => {
	await Pokemon.create('Bulbasaur', 'Grass');
	await Pokemon.create('Charmander', 'Fire');
	await Pokemon.create('Squirtle', 'Water');

	const router = new Router(new Request('GET', '/pokemon', {}), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(Array.isArray(response.getPayload())).toBe(true);
	expect(response.getPayload().length).toBe(3);
	expect(response.getPayload()[0]).toBeInstanceOf(Pokemon);
	expect(response.getPayload()[1]).toBeInstanceOf(Pokemon);
	expect(response.getPayload()[2]).toBeInstanceOf(Pokemon);
});

test('Router dispatched GET /pokemon/1.', async () => {
	await Pokemon.create('Bulbasaur', 'Grass');

	const router = new Router(new Request('GET', '/pokemon/1', {}), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Bulbasaur');
	expect(response.getPayload().getType()).toBe('Grass');
});

test('Router dispatched POST /pokemon.', async () => {
	const router = new Router(new Request('POST', '/pokemon', { name: 'Bulbasaur', type: 'Grass' }), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Bulbasaur');
	expect(response.getPayload().getType()).toBe('Grass');
});

test('Router dispatched PUT /pokemon.', async () => {
	await Pokemon.create('Bulbasaur', 'Grass');

	const router = new Router(new Request('PUT', '/pokemon/1', { name: 'Charmander', type: 'Fire' }), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon updated successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Charmander');
	expect(response.getPayload().getType()).toBe('Fire');
});

test('Router dispatched DELETE /pokemon.', async () => {
	await Pokemon.create('Bulbasaur', 'Grass');

	const router = new Router(new Request('DELETE', '/pokemon/1'), new Response());
	const response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon deleted successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Bulbasaur');
	expect(response.getPayload().getType()).toBe('Grass');
});

afterEach(async () => {
	await Database.truncate([
		'pokemon',
	]);
});

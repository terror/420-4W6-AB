const Response = require('../src/router/Response');
const Pokemon = require('../src/models/Pokemon');
const Database = require('../src/database/Database');

test('Response class has the correct variables and functions.', () => {
	const response = new Response();

	// Variables
	expect(Reflect.has(response, 'statusCode')).toBe(true);
	expect(Reflect.has(response, 'message')).toBe(true);
	expect(Reflect.has(response, 'payload')).toBe(true);

	// Functions
	expect(Reflect.has(response, 'constructor')).toBe(true);
	expect(Reflect.has(response, 'getStatusCode')).toBe(true);
	expect(Reflect.has(response, 'getMessage')).toBe(true);
	expect(Reflect.has(response, 'getPayload')).toBe(true);
	expect(Reflect.has(response, 'setResponse')).toBe(true);
	expect(Reflect.has(response, 'toString')).toBe(true);
});

test('Response class sets default response parameters.', () => {
	const response = new Response();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('');
	expect(response.getPayload()).toMatchObject({});
});

test('Response class sets response parameters through constructor.', async () => {
	const pokemon = await Pokemon.create('Bulbasaur', 'Grass');
	const response = new Response(200, 'Pokemon created successfully!', pokemon);

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Bulbasaur');
	expect(response.getPayload().getType()).toBe('Grass');
});

test('Response class sets response parameters through setResponse().', async () => {
	const pokemon = await Pokemon.create('Bulbasaur', 'Grass');
	const response = new Response();

	response.setResponse({
		statusCode: 200,
		message: 'Pokemon created successfully!',
		payload: pokemon,
	});

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Bulbasaur');
	expect(response.getPayload().getType()).toBe('Grass');
});

test('Response class can stringify response parameters.', async () => {
	const pokemon = await Pokemon.create('Bulbasaur', 'Grass');
	const response = new Response();

	response.setResponse({
		statusCode: 200,
		message: 'Pokemon created successfully!',
		payload: pokemon,
	});

	const stringifiedResponse = response.toString();

	expect(stringifiedResponse).toBe(JSON.stringify(response));
});

afterEach(async () => {
	await Database.truncate([
		'pokemon',
	]);
});

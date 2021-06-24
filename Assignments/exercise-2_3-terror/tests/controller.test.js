const Controller = require('../src/controllers/Controller');
const PokemonController = require('../src/controllers/PokemonController');
const HomeController = require('../src/controllers/HomeController');
const ErrorController = require('../src/controllers/ErrorController');
const Response = require('../src/router/Response');
const Request = require('../src/router/Request');
const Pokemon = require('../src/models/Pokemon');
const Database = require('../src/database/Database');

/**
 * Abstract classes should never be instantiated. We do so here only
 * as a test to ensure you have the right variables and functions.
 */
test('Abstract Controller class has the correct variables and functions.', () => {
	const controller = new Controller();

	// Variables
	expect(Reflect.has(controller, 'request')).toBe(true);
	expect(Reflect.has(controller, 'response')).toBe(true);

	// Functions
	expect(Reflect.has(controller, 'constructor')).toBe(true);
	expect(Reflect.has(controller, 'setAction')).toBe(true);
	expect(Reflect.has(controller, 'getAction')).toBe(true);
	expect(Reflect.has(controller, 'doAction')).toBe(true);
	expect(Reflect.has(controller, 'error')).toBe(true);
});

test('Concrete HomeController class has the correct variables and functions.', () => {
	const homeController = new HomeController(new Request(), new Response());

	// Variables
	expect(Reflect.has(homeController, 'request')).toBe(true);
	expect(Reflect.has(homeController, 'response')).toBe(true);
	expect(Reflect.has(homeController, 'action')).toBe(true);

	// Functions
	expect(Reflect.has(homeController, 'constructor')).toBe(true);
	expect(Reflect.has(homeController, 'home')).toBe(true);
});

test('Concrete ErrorController class has the correct variables and functions.', () => {
	const errorController = new ErrorController(new Request(), new Response());

	// Variables
	expect(Reflect.has(errorController, 'request')).toBe(true);
	expect(Reflect.has(errorController, 'response')).toBe(true);
	expect(Reflect.has(errorController, 'action')).toBe(true);

	// Functions
	expect(Reflect.has(errorController, 'constructor')).toBe(true);
});

test('Concrete PokemonController class has the correct variables and functions.', () => {
	const pokemonController = new PokemonController(new Request(), new Response());

	// Variables
	expect(Reflect.has(pokemonController, 'request')).toBe(true);
	expect(Reflect.has(pokemonController, 'response')).toBe(true);
	expect(Reflect.has(pokemonController, 'action')).toBe(true);

	// Functions
	expect(Reflect.has(pokemonController, 'constructor')).toBe(true);
	expect(Reflect.has(pokemonController, 'new')).toBe(true);
	expect(Reflect.has(pokemonController, 'list')).toBe(true);
	expect(Reflect.has(pokemonController, 'show')).toBe(true);
	expect(Reflect.has(pokemonController, 'edit')).toBe(true);
	expect(Reflect.has(pokemonController, 'destroy')).toBe(true);
});

test('HomeController called the home method.', () => {
	const controller = new HomeController(new Request(), new Response());

	/**
	 * The return value of getAction() should be a function.
	 * Accessing .name on any function in JS will return a string
	 * containing the function's name.
	 */
	const controllerAction = controller.getAction().name;

	expect(controllerAction).toBe('home');
});

test('ErrorController called the error method.', () => {
	const controller = new ErrorController(new Request(), new Response());
	const controllerAction = controller.getAction().name;

	expect(controllerAction).toBe('error');
});

/**
 * This test will be run many times. Each time it runs, it will work
 * with a new set of data that is provided by the table outlined in the
 * "each". Every column in the "each" corresponds to the function input
 * parameters. For example, the first time the test runs, requestMethod
 * will be POST. The second time the test runs, requestMethod will be GET.
 */
test.each`
	requestMethod | path            | action
	${'POST'}     | ${'/pokemon'}   | ${'new'}
	${'GET'}      | ${'/pokemon'}   | ${'list'}
	${'GET'}      | ${'/pokemon/1'} | ${'show'}
	${'PUT'}      | ${'/pokemon/1'} | ${'edit'}
	${'DELETE'}   | ${'/pokemon/1'} | ${'destroy'}
`('PokemonController called the $action method.', ({ requestMethod, path, action }) => {
	const request = new Request(requestMethod, path);
	const controller = new PokemonController(request, new Response());
	const controllerAction = controller.getAction().name;

	expect(controllerAction).toBe(action);
});

test('HomeController handled a homepage request.', async () => {
	const request = new Request('GET', '/');
	const controller = new HomeController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Homepage!');
	expect(response.getPayload()).toMatchObject({});
});

test('ErrorController handled an invalid request path.', async () => {
	const request = new Request('GET', '/digimon');
	const controller = new ErrorController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(404);
	expect(response.getMessage()).toBe('Invalid request path!');
	expect(response.getPayload()).toMatchObject({});
});

test('PokemonController handled an invalid request method.', async () => {
	const request = new Request('PATCH', '/pokemon');
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(405);
	expect(response.getMessage()).toBe('Invalid request method!');
	expect(response.getPayload()).toMatchObject({});
});

test('PokemonController handled a POST request.', async () => {
	const request = new Request('POST', '/pokemon', { name: 'Bulbasaur', type: 'Grass' });
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Bulbasaur');
	expect(response.getPayload().getType()).toBe('Grass');
});

test('PokemonController handled a GET (all) request with no Pokemon in database.', async () => {
	const request = new Request('GET', '/pokemon');
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(Array.isArray(response.getPayload()));
	expect(response.getPayload().length).toBe(0);
});

test('PokemonController handled a GET (all) request with 3 Pokemon in database.', async () => {
	await Pokemon.create('Bulbasaur', 'Grass');
	await Pokemon.create('Charmander', 'Fire');
	await Pokemon.create('Squirtle', 'Water');

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
	await Pokemon.create('Bulbasaur', 'Grass');

	const request = new Request('GET', '/pokemon/1');
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon retrieved successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Bulbasaur');
	expect(response.getPayload().getType()).toBe('Grass');
});

test('PokemonController handled a PUT request.', async () => {
	await Pokemon.create('Bulbasaur', 'Grass');

	const request = new Request('PUT', '/pokemon/1', { name: 'Charmander', type: 'Fire' });
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Pokemon updated successfully!');
	expect(response.getPayload()).toBeInstanceOf(Pokemon);
	expect(response.getPayload().getId()).toBe(1);
	expect(response.getPayload().getName()).toBe('Charmander');
	expect(response.getPayload().getType()).toBe('Fire');
});

test('PokemonController handled a DELETE request.', async () => {
	await Pokemon.create('Bulbasaur', 'Grass');

	const request = new Request('DELETE', '/pokemon/1');
	const controller = new PokemonController(request, new Response());
	const response = await controller.doAction();

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

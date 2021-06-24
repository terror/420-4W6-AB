const Router = require('../src/router/Router');
const Response = require('../src/router/Response');
const Request = require('../src/router/Request');
const Pokemon = require('../src/models/Pokemon');
const Database = require('../src/database/Database');
const HomeController = require('../src/controllers/HomeController');
const ErrorController = require('../src/controllers/ErrorController');
const PokemonController = require('../src/controllers/PokemonController');

/**
 * A "mock" is a testing concept that allows us to "spy" on entities in
 * our application. In our case, we want to spy on the controller and
 * model classes to see when/if they are being invoked. Using these mocks
 * allows us to use the "toHaveBeenCalled" assertion in the third test of
 * this test suite.
 */
jest.mock('../src/controllers/HomeController');
jest.mock('../src/controllers/ErrorController');
jest.mock('../src/controllers/PokemonController');
jest.mock('../src/models/Pokemon');

beforeEach(() => {
	HomeController.mockClear();
	ErrorController.mockClear();
	PokemonController.mockClear();
	Pokemon.mockClear();
});

test('Router class has the correct variables and functions.', () => {
	const router = new Router(new Request(), new Response());

	// Variables
	expect(Reflect.has(router, 'request')).toBe(true);
	expect(Reflect.has(router, 'response')).toBe(true);
	expect(Reflect.has(router, 'controller')).toBe(true);

	// Functions
	expect(Reflect.has(router, 'constructor')).toBe(true);
	expect(Reflect.has(router, 'setController')).toBe(true);
	expect(Reflect.has(router, 'dispatch')).toBe(true);
});

test.each`
	controllerName | controller
	${''}          | ${HomeController}
	${'digimon'}   | ${ErrorController}
	${'pokemon'}   | ${PokemonController}
`('Router set the $controller.name', ({ controllerName, controller }) => {
	const router = new Router(new Request(), new Response());
	router.setController(controllerName);

	expect(router.getController()).toBeInstanceOf(controller);
});

/**
 * This test expects the proper controller to have been invoked after
 * calling the router's dispatch function. It also tests that the model
 * is not being invoked directly from the router. It is now the controller's
 * responsibility to make calls to the the models, therefore the only thing
 * the router should be calling is the controller.
 */
test.each`
	requestMethod | path            | controller           | model
	${'POST'}     | ${'/pokemon'}   | ${PokemonController} | ${Pokemon}
	${'GET'}      | ${'/'}          | ${HomeController}    | ${Pokemon}
	${'GET'}      | ${'/digimon'}   | ${ErrorController}   | ${Pokemon}
	${'GET'}      | ${'/pokemon'}   | ${PokemonController} | ${Pokemon}
	${'GET'}      | ${'/pokemon/1'} | ${PokemonController} | ${Pokemon}
	${'PUT'}      | ${'/pokemon/1'} | ${PokemonController} | ${Pokemon}
	${'DELETE'}   | ${'/pokemon/1'} | ${PokemonController} | ${Pokemon}
`('Router calls $controller.name for a $requestMethod $path request.', async ({
	requestMethod, path, controller, model,
}) => {
	const request = new Request(requestMethod, path);
	const router = new Router(request, new Response());

	await router.dispatch();

	expect(controller).toHaveBeenCalled();
	expect(model).not.toHaveBeenCalled();
});

afterEach(async () => {
	await Database.truncate([
		'pokemon',
	]);
});

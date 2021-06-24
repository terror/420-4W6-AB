const Router = require('../../src/router/Router');
const Response = require('../../src/router/Response');
const Request = require('../../src/router/Request');
const User = require('../../src/models/User');
const Database = require('../../src/database/Database');
const HomeController = require('../../src/controllers/HomeController');
const ErrorController = require('../../src/controllers/ErrorController');
const UserController = require('../../src/controllers/UserController');

/**
 * A "mock" is a testing concept that allows us to "spy" on entities in
 * our application. In our case, we want to spy on the controller and
 * model classes to see when/if they are being invoked. Using these mocks
 * allows us to use the "toHaveBeenCalled" assertion in the third test of
 * this test suite.
 */
jest.mock('../../src/controllers/HomeController');
jest.mock('../../src/controllers/ErrorController');
jest.mock('../../src/controllers/UserController');
jest.mock('../../src/models/User');

beforeEach(() => {
	HomeController.mockClear();
	ErrorController.mockClear();
	UserController.mockClear();
	User.mockClear();
});

test.each`
	controllerName | controller
	${''}          | ${HomeController}
	${'digimon'}   | ${ErrorController}
	${'user'}      | ${UserController}
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
	requestMethod | path          | controller         | model
	${'GET'}      | ${'/'}        | ${HomeController}  | ${User}
	${'GET'}      | ${'/digimon'} | ${ErrorController} | ${User}
	${'POST'}     | ${'/user'}    | ${UserController}  | ${User}
	${'GET'}      | ${'/user'}    | ${UserController}  | ${User}
	${'GET'}      | ${'/user/1'}  | ${UserController}  | ${User}
	${'PUT'}      | ${'/user/1'}  | ${UserController}  | ${User}
	${'DELETE'}   | ${'/user/1'}  | ${UserController}  | ${User}
`('Router called $controller.name for a $requestMethod $path request.', async ({
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
		'user',
	]);
});

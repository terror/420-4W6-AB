const Router = require('../../src/router/Router');
const Response = require('../../src/router/Response');
const Request = require('../../src/router/Request');
const Category = require('../../src/models/Category');
const Database = require('../../src/database/Database');
const CategoryController = require('../../src/controllers/CategoryController');

/**
 * A "mock" is a testing concept that allows us to "spy" on entities in
 * our application. In our case, we want to spy on the controller and
 * model classes to see when/if they are being invoked. Using these mocks
 * allows us to use the "toHaveBeenCalled" assertion in the third test of
 * this test suite.
 */
jest.mock('../../src/controllers/CategoryController');
jest.mock('../../src/models/Category');

beforeEach(() => {
	CategoryController.mockClear();
	Category.mockClear();
});

test('Router set the CategoryController', () => {
	const router = new Router(new Request(), new Response());

	router.setController('category');

	expect(router.getController()).toBeInstanceOf(CategoryController);
});

/**
 * This test expects the proper controller to have been invoked after
 * calling the router's dispatch function. It also tests that the model
 * is not being invoked directly from the router. It is now the controller's
 * responsibility to make calls to the the models, therefore the only thing
 * the router should be calling is the controller.
 */
test.each`
	requestMethod | path
	${'POST'}     | ${'/category'}
	${'GET'}      | ${'/category'}
	${'GET'}      | ${'/category/1'}
	${'PUT'}      | ${'/category/1'}
	${'DELETE'}   | ${'/category/1'}
`('Router called $controller.name for a $requestMethod $path request.', async ({
	requestMethod, path,
}) => {
	const request = new Request(requestMethod, path);
	const router = new Router(request, new Response());

	await router.dispatch();

	expect(CategoryController).toHaveBeenCalled();
	expect(Category).not.toHaveBeenCalled();
});

afterEach(async () => {
	await Database.truncate([
		'category',
	]);
});

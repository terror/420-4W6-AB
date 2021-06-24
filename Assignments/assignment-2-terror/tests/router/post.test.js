const Router = require('../../src/router/Router');
const Response = require('../../src/router/Response');
const Request = require('../../src/router/Request');
const Post = require('../../src/models/Post');
const Database = require('../../src/database/Database');
const PostController = require('../../src/controllers/PostController');

/**
 * A "mock" is a testing concept that allows us to "spy" on entities in
 * our application. In our case, we want to spy on the controller and
 * model classes to see when/if they are being invoked. Using these mocks
 * allows us to use the "toHaveBeenCalled" assertion in the third test of
 * this test suite.
 */
jest.mock('../../src/controllers/PostController');
jest.mock('../../src/models/Post');

beforeEach(() => {
	PostController.mockClear();
	Post.mockClear();
});

test('Router set the PostController', () => {
	const router = new Router(new Request(), new Response());

	router.setController('post');

	expect(router.getController()).toBeInstanceOf(PostController);
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
	${'POST'}     | ${'/post'}
	${'GET'}      | ${'/post'}
	${'GET'}      | ${'/post/1'}
	${'PUT'}      | ${'/post/1'}
	${'DELETE'}   | ${'/post/1'}
`('Router called PostController for a $requestMethod $path request.', async ({
	requestMethod, path,
}) => {
	const request = new Request(requestMethod, path);
	const router = new Router(request, new Response());

	await router.dispatch();

	expect(PostController).toHaveBeenCalled();
	expect(Post).not.toHaveBeenCalled();
});

afterEach(async () => {
	await Database.truncate([
		'post',
	]);
});

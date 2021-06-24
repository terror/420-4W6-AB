const Router = require('../../src/router/Router');
const Response = require('../../src/router/Response');
const Request = require('../../src/router/Request');
const Comment = require('../../src/models/Comment');
const Database = require('../../src/database/Database');
const CommentController = require('../../src/controllers/CommentController');

/**
 * A "mock" is a testing concept that allows us to "spy" on entities in
 * our application. In our case, we want to spy on the controller and
 * model classes to see when/if they are being invoked. Using these mocks
 * allows us to use the "toHaveBeenCalled" assertion in the third test of
 * this test suite.
 */
jest.mock('../../src/controllers/CommentController');
jest.mock('../../src/models/Comment');

beforeEach(() => {
	CommentController.mockClear();
	Comment.mockClear();
});

test('Router set the CommentController', () => {
	const router = new Router(new Request(), new Response());

	router.setController('comment');

	expect(router.getController()).toBeInstanceOf(CommentController);
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
	${'POST'}     | ${'/comment'}
	${'GET'}      | ${'/comment'}
	${'GET'}      | ${'/comment/1'}
	${'PUT'}      | ${'/comment/1'}
	${'DELETE'}   | ${'/comment/1'}
`('Router called CommentController for a $requestMethod $path request.', async ({
	requestMethod, path,
}) => {
	const request = new Request(requestMethod, path);
	const router = new Router(request, new Response());

	await router.dispatch();

	expect(CommentController).toHaveBeenCalled();
	expect(Comment).not.toHaveBeenCalled();
});

afterEach(async () => {
	await Database.truncate([
		'comment',
	]);
});

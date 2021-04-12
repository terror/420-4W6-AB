const Router = require('../../src/router/Router');
const JsonResponse = require('../../src/router/JsonResponse');
const Request = require('../../src/router/Request');
const Database = require('../../src/database/Database');
const {
	generateCommentData,
	generateComment,
	generateRandomId,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Comment created successfully.', async () => {
	const initialCommentId = generateRandomId();
	await truncateDatabase(['comment'], initialCommentId);

	const commentData = await generateCommentData();
	const request = new Request('POST', '/comment', commentData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment created successfully!');
	expect(response.getPayload().getId()).toBe(initialCommentId);
	expect(response.getPayload().getContent()).toBe(commentData.content);
	expect(response.getPayload().getUser().getId()).toBe(commentData.userId);
	expect(response.getPayload().getPost().getId()).toBe(commentData.postId);
	expect(response.getPayload().getCreatedAt()).toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Comment not created with non-existant user.', async () => {
	const commentData = await generateCommentData();

	commentData.userId = generateRandomId(commentData.userId);

	const request = new Request('POST', '/comment', commentData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot create Comment: User does not exist with ID ${commentData.userId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Comment not created with non-existant post.', async () => {
	const commentData = await generateCommentData();

	commentData.postId = generateRandomId(commentData.postId);

	const request = new Request('POST', '/comment', commentData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot create Comment: Post does not exist with ID ${commentData.postId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Comment not created with blank content.', async () => {
	const commentData = await generateCommentData();

	commentData.content = '';

	const request = new Request('POST', '/comment', commentData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Comment: Missing content.');
	expect(response.getPayload()).toMatchObject({});
});

test('Comment found by ID.', async () => {
	const comment = await generateComment();
	const request = new Request('GET', `/comment/${comment.getId()}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment retrieved successfully!');
	expect(response.getPayload().getId()).toBe(comment.getId());
	expect(response.getPayload().getContent()).toBe(comment.getContent());
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Comment not found by wrong ID.', async () => {
	const commentId = generateRandomId();
	const request = new Request('GET', `/comment/${commentId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot retrieve Comment: Comment does not exist with ID ${commentId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Comment updated successfully.', async () => {
	const comment = await generateComment();
	const { content: newCommentContent } = await generateCommentData();
	let request = new Request('PUT', `/comment/${comment.getId()}`, { content: newCommentContent });
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment updated successfully!');
	expect(response.getPayload().getId()).toBe(comment.getId());
	expect(response.getPayload().getContent()).toBe(newCommentContent);
	expect(response.getPayload().getContent()).not.toBe(comment.getContent());
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());

	request = new Request('GET', `/comment/${comment.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getContent()).toBe(newCommentContent);
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).not.toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Comment not updated with non-existant ID.', async () => {
	const commentId = generateRandomId();
	const request = new Request('PUT', `/comment/${commentId}`, { content: 'New content!' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot update Comment: Comment does not exist with ID ${commentId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Comment not updated with blank content.', async () => {
	const comment = await generateComment();
	const request = new Request('PUT', `/comment/${comment.getId()}`, { content: '' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update Comment: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('Comment deleted successfully.', async () => {
	const comment = await generateComment();
	let request = new Request('DELETE', `/comment/${comment.getId()}`);
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment deleted successfully!');
	expect(response.getPayload().getId()).toBe(comment.getId());
	expect(response.getPayload().getContent()).toBe(comment.getContent());
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());

	request = new Request('GET', `/comment/${comment.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getContent()).toBe(comment.getContent());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).not.toBeNull();
});

test('Comment not deleted with non-existant ID.', async () => {
	const commentId = generateRandomId();
	const request = new Request('DELETE', `/comment/${commentId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot delete Comment: Comment does not exist with ID ${commentId}.`);
	expect(response.getPayload()).toMatchObject({});
});

afterEach(async () => {
	await Database.truncate([
		'comment',
	]);
});

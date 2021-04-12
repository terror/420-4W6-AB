const Request = require('../../src/router/Request');
const JsonResponse = require('../../src/router/JsonResponse');
const User = require('../../src/models/User');
const Post = require('../../src/models/Post');
const Comment = require('../../src/models/Comment');
const CommentController = require('../../src/controllers/CommentController');
const {
	generateUser,
	generatePost,
	generateCommentData,
	generateComment,
	generateRandomId,
	truncateDatabase,
} = require('../TestHelper');

let user;
let post;
let initialCommentId;

beforeEach(async () => {
	initialCommentId = generateRandomId();
	await truncateDatabase(['comment'], initialCommentId);

	user = await generateUser();
	post = await generatePost(user);
});

test('CommentController handled a POST request.', async () => {
	const commentData = await generateCommentData(user, post);
	const request = new Request('POST', '/comment', commentData);
	const controller = new CommentController(request, new JsonResponse());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Comment);
	expect(response.getPayload().getId()).toBe(initialCommentId);
	expect(response.getPayload().getContent()).toBe(commentData.content);
	expect(response.getPayload().getUser()).toBeInstanceOf(User);
	expect(response.getPayload().getUser().getId()).toBe(user.getId());
	expect(response.getPayload().getPost()).toBeInstanceOf(Post);
	expect(response.getPayload().getPost().getId()).toBe(post.getId());
});

test('CommentController handled a GET request.', async () => {
	const comment = await generateComment();
	const request = new Request('GET', `/comment/${comment.getId()}`);
	const controller = new CommentController(request, new JsonResponse());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment retrieved successfully!');
	expect(response.getPayload()).toBeInstanceOf(Comment);
	expect(response.getPayload().getId()).toBe(comment.getId());
	expect(response.getPayload().getContent()).toBe(comment.getContent());
	expect(response.getPayload().getUser()).toBeInstanceOf(User);
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost()).toBeInstanceOf(Post);
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('CommentController threw an exception handling a GET request with non-existant ID.', async () => {
	const commentId = generateRandomId();
	const request = new Request('GET', `/comment/${commentId}`);
	const controller = new CommentController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'CommentException',
		message: `Cannot retrieve Comment: Comment does not exist with ID ${commentId}.`,
	});
});

test('CommentController handled a PUT request.', async () => {
	const comment = await generateComment({ type: 'Text' });
	const { content: newCommentContent } = await generateCommentData();
	let request = new Request('PUT', `/comment/${comment.getId()}`, { content: newCommentContent });
	let controller = new CommentController(request, new JsonResponse());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment updated successfully!');
	expect(response.getPayload()).toBeInstanceOf(Comment);
	expect(response.getPayload().getId()).toBe(comment.getId());
	expect(response.getPayload().getContent()).toBe(newCommentContent);
	expect(response.getPayload().getContent()).not.toBe(comment.getContent());
	expect(response.getPayload().getUser()).toBeInstanceOf(User);
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost()).toBeInstanceOf(Post);
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());

	request = new Request('GET', `/comment/${comment.getId()}`);
	controller = new CommentController(request, new JsonResponse());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getContent()).toBe(newCommentContent);
	expect(response.getPayload().getUser()).toBeInstanceOf(User);
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost()).toBeInstanceOf(Post);
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('CommentController threw an exception handling a PUT request with non-existant ID.', async () => {
	const commentId = generateRandomId();
	const request = new Request('PUT', `/comment/${commentId}`, { title: 'New Title' });
	const controller = new CommentController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'CommentException',
		message: `Cannot update Comment: Comment does not exist with ID ${commentId}.`,
	});
});

test('Comment Controller handled a DELETE request.', async () => {
	const comment = await generateComment();
	let request = new Request('DELETE', `/comment/${comment.getId()}`);
	let controller = new CommentController(request, new JsonResponse());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Comment deleted successfully!');
	expect(response.getPayload()).toBeInstanceOf(Comment);
	expect(response.getPayload().getId()).toBe(comment.getId());
	expect(response.getPayload().getContent()).toBe(comment.getContent());
	expect(response.getPayload().getUser()).toBeInstanceOf(User);
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost()).toBeInstanceOf(Post);
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());

	request = new Request('GET', `/comment/${comment.getId()}`);
	controller = new CommentController(request, new JsonResponse());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getContent()).toBe(comment.getContent());
	expect(response.getPayload().getUser()).toBeInstanceOf(User);
	expect(response.getPayload().getUser().getId()).toBe(comment.getUser().getId());
	expect(response.getPayload().getPost()).toBeInstanceOf(Post);
	expect(response.getPayload().getPost().getId()).toBe(comment.getPost().getId());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeInstanceOf(Date);
});

test('CommentController threw an exception handling a DELETE request with non-existant ID.', async () => {
	const commentId = generateRandomId();
	const request = new Request('DELETE', `/comment/${commentId}`);
	const controller = new CommentController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'CommentException',
		message: `Cannot delete Comment: Comment does not exist with ID ${commentId}.`,
	});
});

afterAll(async () => {
	await truncateDatabase();
});

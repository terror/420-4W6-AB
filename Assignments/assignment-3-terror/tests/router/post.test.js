const Router = require('../../src/router/Router');
const JsonResponse = require('../../src/router/JsonResponse');
const Request = require('../../src/router/Request');
const Database = require('../../src/database/Database');
const {
	generatePostData,
	generatePost,
	generateRandomId,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Post created successfully.', async () => {
	const initialPostId = generateRandomId();
	await truncateDatabase(['post'], initialPostId);

	const postData = await generatePostData();
	const request = new Request('POST', '/post', postData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Post created successfully!');
	expect(response.getPayload().getId()).toBe(initialPostId);
	expect(response.getPayload().getTitle()).toBe(postData.title);
	expect(response.getPayload().getContent()).toBe(postData.content);
	expect(response.getPayload().getUser().getId()).toBe(postData.userId);
	expect(response.getPayload().getCategory().getId()).toBe(postData.categoryId);
	expect(response.getPayload().getCreatedAt()).toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Post not created with non-existant user.', async () => {
	const postData = await generatePostData();

	postData.userId = generateRandomId(postData.userId);

	const request = new Request('POST', '/post', postData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot create Post: User does not exist with ID ${postData.userId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Post not created with non-existant category.', async () => {
	const postData = await generatePostData();

	postData.categoryId = generateRandomId(postData.categoryId);

	const request = new Request('POST', '/post', postData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot create Post: Category does not exist with ID ${postData.categoryId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Post not created with blank title.', async () => {
	const postData = await generatePostData();

	postData.title = '';

	const request = new Request('POST', '/post', postData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Post: Missing title.');
	expect(response.getPayload()).toMatchObject({});
});

test('Post not created with blank type.', async () => {
	const postData = await generatePostData();

	postData.type = '';

	const request = new Request('POST', '/post', postData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Post: Missing type.');
	expect(response.getPayload()).toMatchObject({});
});

test('Post not created with blank content.', async () => {
	const postData = await generatePostData();

	postData.content = '';

	const request = new Request('POST', '/post', postData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Post: Missing content.');
	expect(response.getPayload()).toMatchObject({});
});

test('Post found by ID.', async () => {
	const post = await generatePost();
	const request = new Request('GET', `/post/${post.getId()}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Post retrieved successfully!');
	expect(response.getPayload().getId()).toBe(post.getId());
	expect(response.getPayload().getTitle()).toBe(post.getTitle());
	expect(response.getPayload().getContent()).toBe(post.getContent());
	expect(response.getPayload().getUser().getId()).toBe(post.getUser().getId());
	expect(response.getPayload().getCategory().getId()).toBe(post.getCategory().getId());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Post not found by wrong ID.', async () => {
	const postId = generateRandomId();
	const request = new Request('GET', `/post/${postId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot retrieve Post: Post does not exist with ID ${postId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Post (Text) content updated successfully.', async () => {
	const post = await generatePost({ type: 'Text' });
	const { content: newPostContent } = await generatePostData();
	let request = new Request('PUT', `/post/${post.getId()}`, { content: newPostContent });
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Post updated successfully!');
	expect(response.getPayload().getId()).toBe(post.getId());
	expect(response.getPayload().getContent()).toBe(newPostContent);
	expect(response.getPayload().getContent()).not.toBe(post.getContent());
	expect(response.getPayload().getUser().getId()).toBe(post.getUser().getId());
	expect(response.getPayload().getCategory().getId()).toBe(post.getCategory().getId());

	request = new Request('GET', `/post/${post.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getContent()).toBe(newPostContent);
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).not.toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Post (Text) not updated with non-existant ID.', async () => {
	const postId = generateRandomId();
	const request = new Request('PUT', `/post/${postId}`, { content: 'New content!' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot update Post: Post does not exist with ID ${postId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Post (Text) not updated with blank content.', async () => {
	const post = await generatePost({ type: 'Text' });
	const request = new Request('PUT', `/post/${post.getId()}`, { content: '' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update Post: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('Post (URL) not updated.', async () => {
	const post = await generatePost({ type: 'URL' });
	const request = new Request('PUT', `/post/${post.getId()}`, { content: 'https://pokemon.com' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update Post: Only text posts are editable.');
	expect(response.getPayload()).toMatchObject({});
});

test('Post deleted successfully.', async () => {
	const post = await generatePost();
	let request = new Request('DELETE', `/post/${post.getId()}`);
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Post deleted successfully!');
	expect(response.getPayload().getId()).toBe(post.getId());
	expect(response.getPayload().getTitle()).toBe(post.getTitle());
	expect(response.getPayload().getContent()).toBe(post.getContent());
	expect(response.getPayload().getUser().getId()).toBe(post.getUser().getId());
	expect(response.getPayload().getCategory().getId()).toBe(post.getCategory().getId());

	request = new Request('GET', `/post/${post.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getTitle()).toBe(post.getTitle());
	expect(response.getPayload().getContent()).toBe(post.getContent());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).not.toBeNull();
});

test('Post not deleted with non-existant ID.', async () => {
	const postId = generateRandomId();
	const request = new Request('DELETE', `/post/${postId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot delete Post: Post does not exist with ID ${postId}.`);
	expect(response.getPayload()).toMatchObject({});
});

afterEach(async () => {
	await Database.truncate([
		'post',
	]);
});

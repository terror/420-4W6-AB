const Router = require('../../src/router/Router');
const JsonResponse = require('../../src/router/JsonResponse');
const Request = require('../../src/router/Request');
const User = require('../../src/models/User');
const Database = require('../../src/database/Database');
const {
	generateUser,
	generateUsers,
	generateUserData,
	generateRandomId,
	truncateDatabase,
} = require('../TestHelper');

let initialUserId;

beforeEach(async () => {
	initialUserId = generateRandomId();
	await truncateDatabase(['user'], initialUserId);
});

test('Homepage was retrieved successfully.', async () => {
	const request = new Request('GET', '/');
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Homepage!');
	expect(response.getPayload()).toMatchObject({});
});

test('Invalid path returned error.', async () => {
	const request = new Request('GET', '/userr');
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(404);
	expect(response.getMessage()).toBe('Invalid request path!');
	expect(response.getPayload()).toMatchObject({});
});

test('Invalid request method returned error.', async () => {
	const request = new Request('PATCH', '/user');
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(405);
	expect(response.getMessage()).toBe('Invalid request method!');
	expect(response.getPayload()).toMatchObject({});
});

test('User created successfully.', async () => {
	const userData = generateUserData();
	const request = new Request('POST', '/user', userData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User created successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(initialUserId);
	expect(response.getPayload().getUsername()).toBe(userData.username);
	expect(response.getPayload().getEmail()).toBe(userData.email);
	expect(response.getPayload().getCreatedAt()).toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('User not created with blank username.', async () => {
	const userData = await generateUserData('');
	const request = new Request('POST', '/user', userData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create User: Missing username.');
	expect(response.getPayload()).toMatchObject({});
});

test('User not created with blank email.', async () => {
	const userData = await generateUserData(null, '');
	const request = new Request('POST', '/user', userData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create User: Missing email.');
	expect(response.getPayload()).toMatchObject({});
});

test('User not created with blank password.', async () => {
	const userData = await generateUserData(null, null, '');
	const request = new Request('POST', '/user', userData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create User: Missing password.');
	expect(response.getPayload()).toMatchObject({});
});

test('User not created with duplicate username.', async () => {
	const user = await generateUser();
	const userData = await generateUserData(user.getUsername());
	const request = new Request('POST', '/user', userData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create User: Duplicate username.');
	expect(response.getPayload()).toMatchObject({});
});

test('User not created with duplicate email.', async () => {
	const user = await generateUser();
	const userData = await generateUserData(null, user.getEmail());
	const request = new Request('POST', '/user', userData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create User: Duplicate email.');
	expect(response.getPayload()).toMatchObject({});
});

test('All users found.', async () => {
	const users = await generateUsers();
	const request = new Request('GET', '/user');
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Users retrieved successfully!');
	expect(Array.isArray(response.getPayload())).toBe(true);
	expect(response.getPayload().length).toBe(users.length);

	response.getPayload().forEach((user, index) => {
		expect(user).toBeInstanceOf(User);
		expect(user.getId()).toBe(users[index].getId());
		expect(user.getUsername()).toBe(users[index].getUsername());
		expect(user.getEmail()).toBe(users[index].getEmail());
		expect(user.getCreatedAt()).not.toBeNull();
		expect(user.getEditedAt()).toBeNull();
		expect(user.getDeletedAt()).toBeNull();
	});
});

test('User found by ID.', async () => {
	const user = await generateUser();
	const request = new Request('GET', `/user/${user.getId()}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User retrieved successfully!');
	expect(Object.keys(response.getPayload()).includes('id')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('username')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('email')).toBe(true);
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('User not found by wrong ID.', async () => {
	const userId = generateRandomId();
	const request = new Request('GET', `/user/${userId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot retrieve User: User does not exist with ID ${userId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('User updated successfully.', async () => {
	const user = await generateUser();
	const newUserData = generateUserData();
	let request = new Request('PUT', `/user/${user.getId()}`, newUserData);
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User updated successfully!');
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(newUserData.username);
	expect(response.getPayload().getEmail()).toBe(newUserData.email);
	expect(response.getPayload().getUsername()).not.toBe(user.username);
	expect(response.getPayload().getEmail()).not.toBe(user.email);

	request = new Request('GET', `/user/${user.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getUsername()).toBe(newUserData.username);
	expect(response.getPayload().getEmail()).toBe(newUserData.email);
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).not.toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('User not updated with non-existant ID.', async () => {
	const userId = generateRandomId();
	const request = new Request('PUT', `/user/${userId}`, { username: 'NewUsername' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot update User: User does not exist with ID ${userId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('User not updated with blank username.', async () => {
	const user = await generateUser();
	const request = new Request('PUT', `/user/${user.getId()}`, { username: '' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update User: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('User not updated with blank email.', async () => {
	const user = await generateUser();
	const request = new Request('PUT', `/user/${user.getId()}`, { email: '' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update User: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('User deleted successfully.', async () => {
	const user = await generateUser();
	let request = new Request('DELETE', `/user/${user.getId()}`);
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User deleted successfully!');
	expect(Object.keys(response.getPayload()).includes('id')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('username')).toBe(true);
	expect(Object.keys(response.getPayload()).includes('email')).toBe(true);
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());

	request = new Request('GET', `/user/${user.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).not.toBeNull();
});

test('User not deleted with non-existant ID.', async () => {
	const userId = generateRandomId();
	const request = new Request('DELETE', `/user/${userId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot delete User: User does not exist with ID ${userId}.`);
	expect(response.getPayload()).toMatchObject({});
});

afterEach(async () => {
	await Database.truncate([
		'user',
	]);
});

const Request = require('../../src/router/Request');
const JsonResponse = require('../../src/router/JsonResponse');
const User = require('../../src/models/User');
const UserController = require('../../src/controllers/UserController');
const {
	generateUser,
	generateUserData,
	generateRandomId,
	truncateDatabase,
} = require('../TestHelper');

let initialUserId;

beforeEach(async () => {
	initialUserId = generateRandomId();
	await truncateDatabase(['user'], initialUserId);
});

test('UserController handled a POST request.', async () => {
	const userData = generateUserData();
	const request = new Request('POST', '/user', userData);
	const controller = new UserController(request, new JsonResponse());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User created successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(initialUserId);
	expect(response.getPayload().getUsername()).toBe(userData.username);
	expect(response.getPayload().getEmail()).toBe(userData.email);
});

test('UserController threw an exception handling a POST request with blank username.', async () => {
	const userData = generateUserData('');
	const request = new Request('POST', '/user', userData);
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: 'Cannot create User: Missing username.',
	});
});

test('UserController threw an exception handling a POST request with blank email.', async () => {
	const userData = generateUserData(null, '');
	const request = new Request('POST', '/user', userData);
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: 'Cannot create User: Missing email.',
	});
});

test('UserController threw an exception handling a POST request with blank password.', async () => {
	const userData = generateUserData(null, null, '');
	const request = new Request('POST', '/user', userData);
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: 'Cannot create User: Missing password.',
	});
});

test('UserController threw an exception handling a POST request with duplicate username.', async () => {
	const user = await generateUser();
	const userData = await generateUserData(user.getUsername());
	const request = new Request('POST', '/user', userData);
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: 'Cannot create User: Duplicate username.',
	});
});

test('UserController threw an exception handling a POST request with duplicate email.', async () => {
	const user = await generateUser();
	const userData = await generateUserData(null, user.getEmail());
	const request = new Request('POST', '/user', userData);
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: 'Cannot create User: Duplicate email.',
	});
});

test('UserController handled a GET (all) request with no users in database.', async () => {
	const request = new Request('GET', '/user');
	const controller = new UserController(request, new JsonResponse());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Users retrieved successfully!');
	expect(Array.isArray(response.getPayload()));
	expect(response.getPayload().length).toBe(0);
});

test('UserController handled a GET (all) request with 3 users in database.', async () => {
	await generateUser();
	await generateUser();
	await generateUser();

	const request = new Request('GET', '/user');
	const controller = new UserController(request, new JsonResponse());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Users retrieved successfully!');
	expect(Array.isArray(response.getPayload())).toBe(true);
	expect(response.getPayload().length).toBe(3);
	expect(response.getPayload()[0]).toBeInstanceOf(User);
	expect(response.getPayload()[1]).toBeInstanceOf(User);
	expect(response.getPayload()[2]).toBeInstanceOf(User);
});

test('UserController handled a GET (one) request.', async () => {
	const user = await generateUser();
	const request = new Request('GET', `/user/${user.getId()}`);
	const controller = new UserController(request, new JsonResponse());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User retrieved successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('UserController threw an exception handling a GET request with non-existant ID.', async () => {
	const userId = generateRandomId();
	const request = new Request('GET', `/user/${userId}`);
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: `Cannot retrieve User: User does not exist with ID ${userId}.`,
	});
});

test('UserController handled a PUT request.', async () => {
	const user = await generateUser();
	const newUserData = generateUserData();
	let request = new Request('PUT', `/user/${user.getId()}`, newUserData);
	let controller = new UserController(request, new JsonResponse());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User updated successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(newUserData.username);
	expect(response.getPayload().getEmail()).toBe(newUserData.email);
	expect(response.getPayload().getUsername()).not.toBe(user.getUsername());
	expect(response.getPayload().getEmail()).not.toBe(user.getEmail());

	request = new Request('GET', `/user/${user.getId()}`);
	controller = new UserController(request, new JsonResponse());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getUsername()).toBe(newUserData.username);
	expect(response.getPayload().getEmail()).toBe(newUserData.email);
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('UserController threw an exception handling a PUT request with non-existant ID.', async () => {
	const userId = generateRandomId();
	const request = new Request('PUT', `/user/${userId}`, { username: 'NewUsername' });
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: `Cannot update User: User does not exist with ID ${userId}.`,
	});
});

test('UserController threw an exception handling a PUT request with no update fields.', async () => {
	const user = await generateUser();
	const request = new Request('PUT', `/user/${user.getId()}`, {
		username: '',
		email: '',
		password: '',
		avatar: '',
	});
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: 'Cannot update User: No update parameters were provided.',
	});
});

test('UserController handled a DELETE request.', async () => {
	const user = await generateUser();
	let request = new Request('DELETE', `/user/${user.getId()}`);
	let controller = new UserController(request, new JsonResponse());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User deleted successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());

	request = new Request('GET', `/user/${user.getId()}`);
	controller = new UserController(request, new JsonResponse());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeInstanceOf(Date);
});

test('UserController threw an exception handling a DELETE request with non-existant ID.', async () => {
	const userId = generateRandomId();
	const request = new Request('DELETE', `/user/${userId}`);
	const controller = new UserController(request, new JsonResponse());

	await expect(controller.doAction()).rejects.toMatchObject({
		name: 'UserException',
		message: `Cannot delete User: User does not exist with ID ${userId}.`,
	});
});

afterAll(async () => {
	await truncateDatabase();
});

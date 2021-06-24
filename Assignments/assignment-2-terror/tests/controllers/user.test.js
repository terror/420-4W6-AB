const Request = require('../../src/router/Request');
const Response = require('../../src/router/Response');
const User = require('../../src/models/User');
const UserController = require('../../src/controllers/UserController');
const {
	generateUser,
	generateUserData,
	truncateDatabase,
} = require('../TestHelper');

let initialUserId;

beforeEach(async () => {
	initialUserId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['user'], initialUserId);
});

test('UserController handled a POST request.', async () => {
	const userData = generateUserData();
	const request = new Request('POST', '/user', userData);
	const controller = new UserController(request, new Response());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User created successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(initialUserId);
	expect(response.getPayload().getUsername()).toBe(userData.username);
	expect(response.getPayload().getEmail()).toBe(userData.email);
});

test('UserController handled a GET (all) request with no users in database.', async () => {
	const request = new Request('GET', '/user');
	const controller = new UserController(request, new Response());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
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
	const controller = new UserController(request, new Response());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
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
	const controller = new UserController(request, new Response());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
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

test('UserController handled a PUT request.', async () => {
	const user = await generateUser();
	const newUserData = generateUserData();
	let request = new Request('PUT', `/user/${user.getId()}`, newUserData);
	let controller = new UserController(request, new Response());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User updated successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(newUserData.username);
	expect(response.getPayload().getEmail()).toBe(newUserData.email);
	expect(response.getPayload().getUsername()).not.toBe(user.getUsername());
	expect(response.getPayload().getEmail()).not.toBe(user.getEmail());

	request = new Request('GET', `/user/${user.getId()}`);
	controller = new UserController(request, new Response());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getUsername()).toBe(newUserData.username);
	expect(response.getPayload().getEmail()).toBe(newUserData.email);
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('UserController handled a DELETE request.', async () => {
	const user = await generateUser();
	let request = new Request('DELETE', `/user/${user.getId()}`);
	let controller = new UserController(request, new Response());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('User deleted successfully!');
	expect(response.getPayload()).toBeInstanceOf(User);
	expect(response.getPayload().getId()).toBe(user.getId());
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());

	request = new Request('GET', `/user/${user.getId()}`);
	controller = new UserController(request, new Response());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getUsername()).toBe(user.getUsername());
	expect(response.getPayload().getEmail()).toBe(user.getEmail());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeInstanceOf(Date);
});

afterAll(async () => {
	await truncateDatabase();
});

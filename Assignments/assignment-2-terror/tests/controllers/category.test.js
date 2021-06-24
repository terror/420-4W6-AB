const Request = require('../../src/router/Request');
const Response = require('../../src/router/Response');
const Category = require('../../src/models/Category');
const User = require('../../src/models/User');
const CategoryController = require('../../src/controllers/CategoryController');
const {
	generateUser,
	generateCategory,
	generateCategoryData, truncateDatabase,
} = require('../TestHelper');

let user;
let initialCategoryId;

beforeEach(async () => {
	initialCategoryId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['category'], initialCategoryId);

	user = await generateUser();
});

test('CategoryController handled a POST request.', async () => {
	const categoryData = await generateCategoryData(user);
	const request = new Request('POST', '/category', categoryData);
	const controller = new CategoryController(request, new Response());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category created successfully!');
	expect(response.getPayload()).toBeInstanceOf(Category);
	expect(response.getPayload().getId()).toBe(initialCategoryId);
	expect(response.getPayload().getTitle()).toBe(categoryData.title);
	expect(response.getPayload().getDescription()).toBe(categoryData.description);
	expect(response.getPayload().getUser()).toBeInstanceOf(User);
	expect(response.getPayload().getUser().getId()).toBe(user.getId());
});

test('CategoryController handled a GET (all) request with no categories in database.', async () => {
	const request = new Request('GET', '/category');
	const controller = new CategoryController(request, new Response());
	const response = await controller.doAction();

	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Categories retrieved successfully!');
	expect(Array.isArray(response.getPayload()));
	expect(response.getPayload().length).toBe(0);
});

test('CategoryController handled a GET (all) request with 3 categories in database.', async () => {
	await generateCategory();
	await generateCategory();
	await generateCategory();

	const request = new Request('GET', '/category');
	const controller = new CategoryController(request, new Response());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Categories retrieved successfully!');
	expect(Array.isArray(response.getPayload())).toBe(true);
	expect(response.getPayload().length).toBe(3);
	expect(response.getPayload()[0]).toBeInstanceOf(Category);
	expect(response.getPayload()[1]).toBeInstanceOf(Category);
	expect(response.getPayload()[2]).toBeInstanceOf(Category);
});

test('CategoryController handled a GET (one) request.', async () => {
	const category = await generateCategory();
	const request = new Request('GET', `/category/${category.getId()}`);
	const controller = new CategoryController(request, new Response());
	const response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category retrieved successfully!');
	expect(response.getPayload()).toBeInstanceOf(Category);
	expect(response.getPayload().getId()).toBe(category.getId());
	expect(response.getPayload().getTitle()).toBe(category.getTitle());
	expect(response.getPayload().getDescription()).toBe(category.getDescription());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('CategoryController handled a PUT request.', async () => {
	const category = await generateCategory();
	const { title: newCategoryTitle, description: newCategoryDescription } = await generateCategoryData();
	let request = new Request('PUT', `/category/${category.getId()}`, {
		title: newCategoryTitle,
		description: newCategoryDescription,
	});
	let controller = new CategoryController(request, new Response());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category updated successfully!');
	expect(response.getPayload()).toBeInstanceOf(Category);
	expect(response.getPayload().getId()).toBe(category.getId());
	expect(response.getPayload().getTitle()).toBe(newCategoryTitle);
	expect(response.getPayload().getDescription()).toBe(newCategoryDescription);
	expect(response.getPayload().getTitle()).not.toBe(category.getTitle());
	expect(response.getPayload().getDescription()).not.toBe(category.getDescription());

	request = new Request('GET', `/category/${category.getId()}`);
	controller = new CategoryController(request, new Response());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getTitle()).toBe(newCategoryTitle);
	expect(response.getPayload().getDescription()).toBe(newCategoryDescription);
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('CategoryController handled a DELETE request.', async () => {
	const category = await generateCategory();
	let request = new Request('DELETE', `/category/${category.getId()}`);
	let controller = new CategoryController(request, new Response());
	let response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category deleted successfully!');
	expect(response.getPayload()).toBeInstanceOf(Category);
	expect(response.getPayload().getId()).toBe(category.getId());
	expect(response.getPayload().getTitle()).toBe(category.getTitle());
	expect(response.getPayload().getDescription()).toBe(category.getDescription());

	request = new Request('GET', `/category/${category.getId()}`);
	controller = new CategoryController(request, new Response());
	response = await controller.doAction();

	expect(response).toBeInstanceOf(Response);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getTitle()).toBe(category.getTitle());
	expect(response.getPayload().getDescription()).toBe(category.getDescription());
	expect(response.getPayload().getCreatedAt()).toBeInstanceOf(Date);
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeInstanceOf(Date);
});

afterAll(async () => {
	await truncateDatabase();
});

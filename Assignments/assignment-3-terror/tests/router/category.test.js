const Router = require('../../src/router/Router');
const JsonResponse = require('../../src/router/JsonResponse');
const Request = require('../../src/router/Request');
const Database = require('../../src/database/Database');
const {
	generateCategoryData,
	generateCategory,
	generateCategories,
	generateRandomId,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Category created successfully.', async () => {
	const initialCategoryId = generateRandomId();
	await truncateDatabase(['category'], initialCategoryId);

	const categoryData = await generateCategoryData();
	const request = new Request('POST', '/category', categoryData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category created successfully!');
	expect(response.getPayload().getId()).toBe(initialCategoryId);
	expect(response.getPayload().getTitle()).toBe(categoryData.title);
	expect(response.getPayload().getDescription()).toBe(categoryData.description);
	expect(response.getPayload().getUser().getId()).toBe(categoryData.userId);
	expect(response.getPayload().getCreatedAt()).toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Category not created with non-existant user.', async () => {
	const categoryData = await generateCategoryData();

	categoryData.userId = generateRandomId(categoryData.userId);

	const request = new Request('POST', '/category', categoryData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot create Category: User does not exist with ID ${categoryData.userId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Category not created with blank title.', async () => {
	const categoryData = await generateCategoryData();

	categoryData.title = '';

	const request = new Request('POST', '/category', categoryData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Category: Missing title.');
	expect(response.getPayload()).toMatchObject({});
});

test('Category not created with duplicate title.', async () => {
	const category = await generateCategory();
	const categoryData = await generateCategoryData();

	categoryData.title = category.getTitle();

	const request = new Request('POST', '/category', categoryData);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot create Category: Duplicate title.');
	expect(response.getPayload()).toMatchObject({});
});

test('All categories found.', async () => {
	const categories = await generateCategories();
	const request = new Request('GET', '/category');
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Categories retrieved successfully!');
	expect(Array.isArray(response.getPayload())).toBe(true);
	expect(response.getPayload().length).toBe(categories.length);

	response.getPayload().forEach((category, index) => {
		expect(category.id).toBe(categories[index].getId());
		expect(category.title).toBe(categories[index].getTitle());
		expect(category.description).toBe(categories[index].getDescription());
		expect(category.user.id).toBe(categories[index].getUser().getId());
		expect(category.createdAt).not.toBeNull();
		expect(category.editedAt).toBeNull();
		expect(category.deletedAt).toBeNull();
	});
});

test('Category found by ID.', async () => {
	const category = await generateCategory();
	const request = new Request('GET', `/category/${category.getId()}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category retrieved successfully!');
	expect(response.getPayload().getId()).toBe(category.getId());
	expect(response.getPayload().getTitle()).toBe(category.getTitle());
	expect(response.getPayload().getDescription()).toBe(category.getDescription());
	expect(response.getPayload().getUser().getId()).toBe(category.getUser().getId());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Category not found by wrong ID.', async () => {
	const categoryId = generateRandomId();
	const request = new Request('GET', `/category/${categoryId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot retrieve Category: Category does not exist with ID ${categoryId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Category updated successfully.', async () => {
	const category = await generateCategory();
	const newCategoryData = await generateCategoryData();
	let request = new Request('PUT', `/category/${category.getId()}`, newCategoryData);
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category updated successfully!');
	expect(response.getPayload().getId()).toBe(category.getId());
	expect(response.getPayload().getTitle()).toBe(newCategoryData.title);
	expect(response.getPayload().getDescription()).toBe(newCategoryData.description);
	expect(response.getPayload().getTitle()).not.toBe(category.getTitle());
	expect(response.getPayload().getDescription()).not.toBe(category.getDescription());

	request = new Request('GET', `/category/${category.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getTitle()).toBe(newCategoryData.title);
	expect(response.getPayload().getDescription()).toBe(newCategoryData.description);
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).not.toBeNull();
	expect(response.getPayload().getDeletedAt()).toBeNull();
});

test('Category not updated with non-existant ID.', async () => {
	const categoryId = generateRandomId();
	const request = new Request('PUT', `/category/${categoryId}`, { title: 'New Title' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot update Category: Category does not exist with ID ${categoryId}.`);
	expect(response.getPayload()).toMatchObject({});
});

test('Category not updated with blank title.', async () => {
	const category = await generateCategory();
	const request = new Request('PUT', `/category/${category.getId()}`, { title: '' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update Category: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('Category not updated with blank description.', async () => {
	const category = await generateCategory();
	const request = new Request('PUT', `/category/${category.getId()}`, { description: '' });
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe('Cannot update Category: No update parameters were provided.');
	expect(response.getPayload()).toMatchObject({});
});

test('Category deleted successfully.', async () => {
	const category = await generateCategory();
	let request = new Request('DELETE', `/category/${category.getId()}`);
	let router = new Router(request, new JsonResponse());
	let response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getMessage()).toBe('Category deleted successfully!');
	expect(response.getPayload().getId()).toBe(category.getId());
	expect(response.getPayload().getTitle()).toBe(category.getTitle());
	expect(response.getPayload().getDescription()).toBe(category.getDescription());

	request = new Request('GET', `/category/${category.getId()}`);
	router = new Router(request, new JsonResponse());
	response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(200);
	expect(response.getPayload().getTitle()).toBe(category.getTitle());
	expect(response.getPayload().getDescription()).toBe(category.getDescription());
	expect(response.getPayload().getCreatedAt()).not.toBeNull();
	expect(response.getPayload().getEditedAt()).toBeNull();
	expect(response.getPayload().getDeletedAt()).not.toBeNull();
});

test('Category not deleted with non-existant ID.', async () => {
	const categoryId = generateRandomId();
	const request = new Request('DELETE', `/category/${categoryId}`);
	const router = new Router(request, new JsonResponse());
	const response = await router.dispatch();

	expect(response).toBeInstanceOf(JsonResponse);
	expect(response.getStatusCode()).toBe(400);
	expect(response.getMessage()).toBe(`Cannot delete Category: Category does not exist with ID ${categoryId}.`);
	expect(response.getPayload()).toMatchObject({});
});

afterEach(async () => {
	await Database.truncate([
		'category',
	]);
});

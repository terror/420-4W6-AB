const {
	generateCategoryData,
	generateCategory,
	makeHttpRequest,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Category created successfully.', async () => {
	const initialCategoryId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['category'], initialCategoryId);

	const categoryData = await generateCategoryData();
	const [statusCode, response] = await makeHttpRequest('POST', '/category', categoryData);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category created successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('description')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(response.payload.id).toBe(initialCategoryId);
	expect(response.payload.title).toBe(categoryData.title);
	expect(response.payload.description).toBe(categoryData.description);
	expect(response.payload.user.id).toBe(categoryData.userId);
	expect(response.payload.createdAt).toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Category not created with non-existant user.', async () => {
	const categoryData = await generateCategoryData();

	categoryData.userId = 999;

	const [statusCode, response] = await makeHttpRequest('POST', '/category', categoryData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not created.');
	expect(response.payload).toMatchObject({});
});

test('Category not created with blank title.', async () => {
	const categoryData = await generateCategoryData();

	categoryData.title = '';

	const [statusCode, response] = await makeHttpRequest('POST', '/category', categoryData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not created.');
	expect(response.payload).toMatchObject({});
});

test('Category not created with duplicate title.', async () => {
	const category = await generateCategory();
	const categoryData = await generateCategoryData();

	categoryData.title = category.getTitle();

	const [statusCode, response] = await makeHttpRequest('POST', '/category', categoryData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not created.');
	expect(response.payload).toMatchObject({});
});

test('All categories found.', async () => {
	let categories = [];
	const numberOfCategories = Math.floor(Math.random() * 10) + 1;

	for (let i = 0; i < numberOfCategories; i++) {
		categories.push(generateCategory());
	}

	categories = await Promise.all(categories);

	categories.sort((categoryA, categoryB) => categoryA.getId() - categoryB.getId());

	const [statusCode, response] = await makeHttpRequest('GET', '/category');

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Categories retrieved successfully!');
	expect(Array.isArray(response.payload)).toBe(true);
	expect(response.payload.length).toBe(numberOfCategories);

	response.payload.forEach((category, index) => {
		expect(Object.keys(category).includes('id')).toBe(true);
		expect(Object.keys(category).includes('title')).toBe(true);
		expect(Object.keys(category).includes('description')).toBe(true);
		expect(Object.keys(category).includes('user')).toBe(true);
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
	const [statusCode, response] = await makeHttpRequest('GET', `/category/${category.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category retrieved successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('description')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(response.payload.id).toBe(category.getId());
	expect(response.payload.title).toBe(category.getTitle());
	expect(response.payload.description).toBe(category.getDescription());
	expect(response.payload.user.id).toBe(category.getUser().getId());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Category not found by wrong ID.', async () => {
	const categoryId = Math.floor(Math.random() * 100) + 1;
	const [statusCode, response] = await makeHttpRequest('GET', `/category/${categoryId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not retrieved.');
	expect(response.payload).toMatchObject({});
});

test('Category updated successfully.', async () => {
	const category = await generateCategory();
	const newCategoryData = await generateCategoryData();
	let [statusCode, response] = await makeHttpRequest('PUT', `/category/${category.getId()}`, newCategoryData);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category updated successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('description')).toBe(true);
	expect(response.payload.id).toBe(category.getId());
	expect(response.payload.title).toBe(newCategoryData.title);
	expect(response.payload.description).toBe(newCategoryData.description);
	expect(response.payload.title).not.toBe(category.getTitle());
	expect(response.payload.description).not.toBe(category.getDescription());

	[statusCode, response] = await makeHttpRequest('GET', `/category/${category.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.title).toBe(newCategoryData.title);
	expect(response.payload.description).toBe(newCategoryData.description);
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).not.toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Category not updated with non-existant ID.', async () => {
	const [statusCode, response] = await makeHttpRequest('PUT', '/category/1', { title: 'Pokemon' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not updated.');
	expect(response.payload).toMatchObject({});
});

test('Category not updated with blank title.', async () => {
	const category = await generateCategory();
	const [statusCode, response] = await makeHttpRequest('PUT', `/category/${category.getId()}`, { title: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not updated.');
	expect(response.payload).toMatchObject({});
});

test('Category not updated with blank description.', async () => {
	const category = await generateCategory();
	const [statusCode, response] = await makeHttpRequest('PUT', `/category/${category.getId()}`, { description: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not updated.');
	expect(response.payload).toMatchObject({});
});

test('Category deleted successfully.', async () => {
	const category = await generateCategory();
	let [statusCode, response] = await makeHttpRequest('DELETE', `/category/${category.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category deleted successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('description')).toBe(true);
	expect(response.payload.id).toBe(category.getId());
	expect(response.payload.title).toBe(category.getTitle());
	expect(response.payload.description).toBe(category.getDescription());

	[statusCode, response] = await makeHttpRequest('GET', `/category/${category.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.title).toBe(category.getTitle());
	expect(response.payload.description).toBe(category.getDescription());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).not.toBeNull();
});

test('Category not deleted with non-existant ID.', async () => {
	const [statusCode, response] = await makeHttpRequest('DELETE', '/category/1');

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Category not deleted.');
	expect(response.payload).toMatchObject({});
});

afterAll(async () => {
	await truncateDatabase();
});

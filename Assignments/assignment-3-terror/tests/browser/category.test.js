const { chromium } = require('playwright-chromium');
const Url = require('../../src/helpers/Url');
const Category = require('../../src/models/Category');
const {
	generateCategoryData,
	generateCategory,
	truncateDatabase,
	generateRandomId,
} = require('../TestHelper');

let browser;
let page;

beforeAll(async () => {
	browser = await chromium.launch({
		// headless: false,
		// slowMo: 500,
	});
});

afterAll(async () => {
	await browser.close();
});

beforeEach(async () => {
	page = await browser.newPage();
});

afterEach(async () => {
	await page.close();
	await truncateDatabase();
});

test('Category created successfully.', async () => {
	const categoryData = await generateCategoryData();

	await page.goto(Url.base());
	await page.waitForSelector('form#new-category-form');
	await page.fill('form#new-category-form input[name="userId"]', categoryData.userId.toString());
	await page.fill('form#new-category-form input[name="title"]', categoryData.title);
	await page.fill('form#new-category-form input[name="description"]', categoryData.description);
	await page.click('form#new-category-form button');
	await page.waitForSelector('table#categories');

	const category = await Category.findByTitle(categoryData.title);
	const categoryRowElement = await page.$(`table#categories tr[category-id="${category.getId()}"]`);

	expect(await categoryRowElement.innerText()).toMatch(category.getTitle());
	expect(await categoryRowElement.innerText()).toMatch(category.getCreatedAt().toString());
	expect(await categoryRowElement.innerText()).toMatch(category.getUser().getUsername());
	expect(await categoryRowElement.innerText()).toMatch('No');
});

test('Many categories created successfully.', async () => {
	for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
		const categoryData = await generateCategoryData();

		await page.goto(Url.base());
		await page.waitForSelector('form#new-category-form');
		await page.fill('form#new-category-form input[name="userId"]', categoryData.userId.toString());
		await page.fill('form#new-category-form input[name="title"]', categoryData.title);
		await page.fill('form#new-category-form input[name="description"]', categoryData.description);
		await page.click('form#new-category-form button');
		await page.waitForSelector('table#categories');

		const category = await Category.findByTitle(categoryData.title);
		const categoryRowElement = await page.$(`table#categories tr[category-id="${category.getId()}"]`);

		expect(await categoryRowElement.innerText()).toMatch(category.getTitle());
		expect(await categoryRowElement.innerText()).toMatch(category.getCreatedAt().toString());
		expect(await categoryRowElement.innerText()).toMatch(category.getUser().getUsername());
		expect(await categoryRowElement.innerText()).toMatch('No');
	}
});

test.each`
	userId   | title        | description                      | message                               | categoryExists
	${''}    | ${'Pokemon'} | ${'The best Pokemon community!'} | ${'Missing userId.'}                  | ${false}
	${'1'}   | ${''}        | ${'The best Pokemon community!'} | ${'Missing title.'}                   | ${false}
	${'1'}   | ${'Pokemon'} | ${''}                            | ${'Missing description.'}             | ${false}
	${'999'} | ${'Pokemon'} | ${'The best Pokemon community!'} | ${'User does not exist with ID 999.'} | ${true}
`('Category not created with $message.', async ({
	userId, title, description, message, categoryExists,
}) => {
	if (categoryExists) {
		await generateCategory(null, 'Pokemon', 'The best Pokemon community!');
	}

	await page.goto(Url.base());
	await page.waitForSelector('form#new-category-form');
	await page.fill('form#new-category-form input[name="userId"]', userId);
	await page.fill('form#new-category-form input[name="title"]', title);
	await page.fill('form#new-category-form input[name="description"]', description);
	await page.click('form#new-category-form button');
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot create Category: ${message}`);
});

test('Category found by ID.', async () => {
	const category = await generateCategory();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', category.getId())}"]`);
	await page.waitForSelector('#category-title');

	const titleElement = await page.$('#category-title');
	const descriptionElement = await page.$('#category-description');

	expect(await titleElement.innerText()).toBe(category.getTitle());
	expect(await descriptionElement.innerText()).toBe(category.getDescription());
});

test('Category not found by wrong ID.', async () => {
	const randomCategoryId = generateRandomId();

	await page.goto(Url.path('category/{id}', randomCategoryId));
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot retrieve Category: Category does not exist with ID ${randomCategoryId}.`);
});

test('Category updated successfully.', async () => {
	const category = await generateCategory();
	const newCategoryData = await generateCategoryData();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', category.getId())}"]`);
	await page.click(`a[href="${Url.path('category/{id}/edit', category.getId())}"]`);
	await page.fill('form#edit-category-form input[name="title"]', newCategoryData.title);
	await page.fill('form#edit-category-form input[name="description"]', newCategoryData.description);
	await page.click('form#edit-category-form button');

	expect(await page.title()).toBe(newCategoryData.title);
	expect(await page.url()).toBe(Url.path(`category/${category.getId()}`));

	await page.waitForSelector('#category-title');

	const titleElement = await page.$('#category-title');
	const descriptionElement = await page.$('#category-description');

	expect(await titleElement.innerText()).toBe(newCategoryData.title);
	expect(await descriptionElement.innerText()).toBe(newCategoryData.description);
});

test('Category not updated with empty form.', async () => {
	const category = await generateCategory();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', category.getId())}"]`);
	await page.click(`a[href="${Url.path('category/{id}/edit', category.getId())}"]`);
	await page.click('form#edit-category-form button');

	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch('Cannot update Category: No update parameters were provided.');
});

test('Category deleted successfully.', async () => {
	const category = await generateCategory();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', category.getId())}"]`);
	await page.click('form#delete-category-form button');
	await page.waitForSelector('table#categories');

	const categoryRowElement = await page.$(`table#categories tr[category-id="${category.getId()}"]`);

	expect(await categoryRowElement.innerText()).toMatch(category.getTitle());
	expect(await categoryRowElement.innerText()).toMatch(category.getUser().getUsername());
	expect(await categoryRowElement.innerText()).toMatch('Yes');
});

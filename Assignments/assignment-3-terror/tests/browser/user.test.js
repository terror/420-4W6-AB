const { chromium } = require('playwright-chromium');
const Url = require('../../src/helpers/Url');
const User = require('../../src/models/User');
const {
	generateUserData,
	generateUser,
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

test('Homepage was retrieved successfully', async () => {
	await page.goto(Url.base());

	expect(await page.title()).toBe('Welcome');
	expect(await page.$(`nav a[href="${Url.path('user/new')}"]`)).not.toBeNull();

	await page.waitForSelector('h1');

	const h1 = await page.$('h1');

	expect(await h1.innerText()).toBe('Welcome to Reddit!');
});

test('Invalid path returned error.', async () => {
	await page.goto(Url.path('userr'));
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch('Invalid request path!');
});

test('User created successfully.', async () => {
	const userData = generateUserData();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('user/new')}"]`);

	const h1 = await page.$('h1');

	expect(await h1.innerText()).toMatch('Register');

	await page.fill('form#new-user-form input[name="username"]', userData.username);
	await page.fill('form#new-user-form input[name="email"]', userData.email);
	await page.fill('form#new-user-form input[name="password"]', userData.password);
	await page.click('form#new-user-form button');

	const user = await User.findByUsername(userData.username);

	expect(await page.title()).toBe(user.getUsername());
	expect(await page.url()).toBe(Url.path(`user/${user.getId()}`));

	await page.waitForSelector('#username');

	const usernameElement = await page.$('#username');
	const emailElement = await page.$('#email');

	expect(await usernameElement.innerText()).toBe(userData.username);
	expect(await emailElement.innerText()).toBe(userData.email);
});

test.each`
	username        | email                       | password      | message                  | userExists
	${''}           | ${'bulbasaur@pokemon.com'}  | ${'Grass123'} | ${'Missing username.'}   | ${false}
	${'Bulbasaur'}  | ${''}                       | ${'Grass123'} | ${'Missing email.'}      | ${false}
	${'Bulbasaur'}  | ${'bulbasaur@pokemon.com'}  | ${''}         | ${'Missing password.'}   | ${false}
	${'Bulbasaur1'} | ${'bulbasaur@pokemon.com'}  | ${'Grass123'} | ${'Duplicate email.'}    | ${true}
	${'Bulbasaur'}  | ${'bulbasaur1@pokemon.com'} | ${'Grass123'} | ${'Duplicate username.'} | ${true}
`('User not created with $message.', async ({
	username, email, password, message, userExists,
}) => {
	if (userExists) {
		await generateUser('Bulbasaur', 'bulbasaur@pokemon.com', 'Grass123');
	}

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('user/new')}"]`);

	let h1 = await page.$('h1');

	expect(await h1.innerText()).toMatch('Register');

	await page.fill('form#new-user-form input[name="username"]', username);
	await page.fill('form#new-user-form input[name="email"]', email);
	await page.fill('form#new-user-form input[name="password"]', password);
	await page.click('form#new-user-form button');
	await page.waitForSelector('h1');

	h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot create User: ${message}`);
});

test('User found by ID.', async () => {
	const user = await generateUser();

	await page.goto(Url.path('user/{id}', user.getId()));
	await page.waitForSelector('#username');

	const usernameElement = await page.$('#username');
	const emailElement = await page.$('#email');

	expect(await usernameElement.innerText()).toBe(user.getUsername());
	expect(await emailElement.innerText()).toBe(user.getEmail());
});

test('User not found by wrong ID.', async () => {
	const randomUserId = generateRandomId();

	await page.goto(Url.path('user/{id}', randomUserId));
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot retrieve User: User does not exist with ID ${randomUserId}.`);
});

test('User updated successfully.', async () => {
	let user = await generateUser();
	const newUserData = generateUserData();

	await page.goto(Url.path('user/{id}', user.getId()));
	await page.waitForSelector('form#edit-user-form');
	await page.fill('form#edit-user-form input[name="username"]', newUserData.username);
	await page.fill('form#edit-user-form input[name="email"]', newUserData.email);
	await page.fill('form#edit-user-form input[name="password"]', newUserData.password);
	await page.click('form#edit-user-form button');

	user = await User.findByUsername(newUserData.username);

	expect(await page.title()).toBe(user.getUsername());
	expect(await page.url()).toBe(Url.path(`user/${user.getId()}`));

	await page.waitForSelector('#username');

	const usernameElement = await page.$('#username');
	const emailElement = await page.$('#email');

	expect(await usernameElement.innerText()).toBe(newUserData.username);
	expect(await emailElement.innerText()).toBe(newUserData.email);
});

test('User not updated with empty form.', async () => {
	const user = await generateUser();

	await page.goto(Url.path('user/{id}', user.getId()));
	await page.waitForSelector('form#edit-user-form');
	await page.click('form#edit-user-form button');

	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch('Cannot update User: No update parameters were provided.');
});

test('User deleted successfully.', async () => {
	let user = await generateUser();

	await page.goto(Url.path('user/{id}', user.getId()));
	await page.waitForSelector('form#delete-user-form');
	await page.click('form#delete-user-form button');
	await page.waitForSelector('body');

	user = await User.findById(user.getId());
	const body = await page.$('body');

	expect(await body.innerText()).toMatch(`User was deleted on ${user.getDeletedAt()}`);
});

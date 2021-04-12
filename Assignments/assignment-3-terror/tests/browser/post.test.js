const { chromium } = require('playwright-chromium');
const Url = require('../../src/helpers/Url');
const Post = require('../../src/models/Post');
const {
	generatePostData,
	generatePost,
	truncateDatabase,
	generateRandomId,
	generateCategory,
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

test.only('Post created successfully.', async () => {
	const postData = await generatePostData();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', postData.categoryId)}"]`);
	await page.fill('form#new-post-form input[name="userId"]', postData.userId.toString());
	await page.fill('form#new-post-form input[name="title"]', postData.title);
	await page.selectOption('form#new-post-form select', postData.type);
	await page.fill('form#new-post-form textarea[name="content"]', postData.content);
	await page.click('form#new-post-form button');

	expect(await page.url()).toBe(Url.path('category/{id}', postData.categoryId));

	await page.waitForSelector('table#posts');

	const post = (await Post.findByCategory(postData.categoryId))[0];
	const postRowElement = await page.$(`table#posts tr[post-id="${post.getId()}"]`);

	expect(await postRowElement.innerText()).toMatch(post.getTitle());
	expect(await postRowElement.innerText()).toMatch(post.getCreatedAt().toString());
	expect(await postRowElement.innerText()).toMatch(post.getUser().getUsername());
	expect(await postRowElement.innerText()).toMatch('No');
});

test.only('Many posts created successfully.', async () => {
	for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
		const postData = await generatePostData();

		await page.goto(Url.base());
		await page.click(`a[href="${Url.path('category/{id}', postData.categoryId)}"]`);
		await page.fill('form#new-post-form input[name="userId"]', postData.userId.toString());
		await page.fill('form#new-post-form input[name="title"]', postData.title);
		await page.selectOption('form#new-post-form select', postData.type);
		await page.fill('form#new-post-form textarea[name="content"]', postData.content);
		await page.click('form#new-post-form button');

		expect(await page.url()).toBe(Url.path('category/{id}', postData.categoryId));

		await page.waitForSelector('table#posts');

		const post = (await Post.findByCategory(postData.categoryId))[0];
		const postRowElement = await page.$(`table#posts tr[post-id="${post.getId()}"]`);

		expect(await postRowElement.innerText()).toMatch(post.getTitle());
		expect(await postRowElement.innerText()).toMatch(post.getCreatedAt().toString());
		expect(await postRowElement.innerText()).toMatch(post.getUser().getUsername());
		expect(await postRowElement.innerText()).toMatch('No');
	}
});

test.only.each`
	userId   | title             | type      | content       | message
	${'1'}   | ${''}             | ${'Text'} | ${'Magikarp'} | ${'Missing title.'}
	${'1'}   | ${'Best Pokemon'} | ${''}     | ${'Rattata'}  | ${'Missing type.'}
	${'1'}   | ${'Best Pokemon'} | ${'Text'} | ${''}         | ${'Missing content.'}
	${'999'} | ${'Best Pokemon'} | ${'Text'} | ${'Pidgey'}   | ${'User does not exist with ID 999.'}
`('Post not created with $message.', async ({
	userId, title, type, content, message,
}) => {
	const category = await generateCategory();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', category.getId())}"]`);
	await page.waitForSelector('form#new-post-form');
	await page.fill('form#new-post-form input[name="userId"]', userId);
	await page.fill('form#new-post-form input[name="title"]', title);
	await page.selectOption('form#new-post-form select', type);
	await page.fill('form#new-post-form textarea[name="content"]', content);
	await page.click('form#new-post-form button');
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot create Post: ${message}`);
});

test.only('Post found by ID.', async () => {
	const post = await generatePost();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.waitForSelector('#post-title');

	const titleElement = await page.$('#post-title');
	const contentElement = await page.$('#post-content');

	expect(await titleElement.innerText()).toBe(post.getTitle());
	expect(await contentElement.innerText()).toBe(post.getContent());
});

test.only('Post not found by wrong ID.', async () => {
	const randomPostId = generateRandomId();

	await page.goto(Url.path('post/{id}', randomPostId));
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot retrieve Post: Post does not exist with ID ${randomPostId}.`);
});

test.only('Post updated successfully.', async () => {
	const post = await generatePost({ type: 'Text' });
	const { content } = await generatePostData('Text');

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}/edit', post.getId())}"]`);
	await page.waitForSelector('form#edit-post-form textarea[name="content"]');

	let contentElement = await page.$('form#edit-post-form textarea[name="content"]');
	const contentElementValue = await page.$eval('form#edit-post-form textarea[name="content"]', (el) => el.value);

	expect(contentElementValue).toBe(post.getContent());

	await contentElement.selectText();
	await page.keyboard.press('Backspace');
	await page.fill('form#edit-post-form textarea[name="content"]', content);
	await page.click('form#edit-post-form button');
	await page.waitForSelector('#post-title');

	const titleElement = await page.$('#post-title');
	contentElement = await page.$('#post-content');

	expect(await titleElement.innerText()).toBe(post.getTitle());
	expect(await contentElement.innerText()).toBe(content);
});

test.only('Post not updated with empty form.', async () => {
	const post = await generatePost({ type: 'Text' });

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}/edit', post.getId())}"]`);
	await page.waitForSelector('form#edit-post-form textarea[name="content"]');

	const contentElement = await page.$('form#edit-post-form textarea[name="content"]');
	const contentElementValue = await page.$eval('form#edit-post-form textarea[name="content"]', (el) => el.value);

	expect(contentElementValue).toBe(post.getContent());

	await contentElement.selectText();
	await page.keyboard.press('Backspace');
	await page.click('form#edit-post-form button');
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch('Cannot update Post: No update parameters were provided.');
});

test.only('URL post should have no update interface.', async () => {
	const post = await generatePost({ type: 'URL' });

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.waitForSelector('#post-title');

	expect(await page.$(`a[href="${Url.path('post/{id}/edit', post.getId())}"]`)).toBeNull();
});

test.only('Post deleted successfully.', async () => {
	const post = await generatePost();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click('form#delete-post-form button');

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.waitForSelector('table#posts');

	const postRowElement = await page.$(`table#posts tr[post-id="${post.getId()}"]`);

	expect(await postRowElement.innerText()).toMatch(post.getTitle());
	expect(await postRowElement.innerText()).toMatch(post.getUser().getUsername());
	expect(await postRowElement.innerText()).toMatch('Yes');
});

test.only('Deleted post should be read-only.', async () => {
	const post = await generatePost();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click('form#delete-post-form button');

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.waitForSelector('#post-title');

	expect(await page.$('form#edit-post-form')).toBeNull();
	expect(await page.$('form#delete-post-form')).toBeNull();
	expect(await page.$('form#new-comment-form')).toBeNull();
});

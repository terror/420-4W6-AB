const { chromium } = require('playwright-chromium');
const Url = require('../../src/helpers/Url');
const Comment = require('../../src/models/Comment');
const {
	generateCommentData,
	generateComment,
	truncateDatabase,
	generateRandomId,
	generatePost,
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

test('Comment created successfully.', async () => {
	const post = await generatePost();
	const commentData = await generateCommentData(null, post);

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.waitForSelector('form#new-comment-form');

	const postIdInputValue = await page.$eval('form#new-comment-form input[name="postId"]', (el) => el.value);

	expect(postIdInputValue).toBe(post.getId().toString());

	await page.fill('form#new-comment-form input[name="userId"]', commentData.userId.toString());
	await page.fill('form#new-comment-form textarea[name="content"]', commentData.content);
	await page.click('form#new-comment-form button');

	await page.waitForSelector('section#comments');

	expect(await page.url()).toBe(Url.path('post/{id}', post.getId()));

	const comment = (await Comment.findByPost(post.getId()))[0];
	const commentElement = await page.$(`.comment[comment-id="${comment.getId()}"]`);

	expect(await commentElement.innerText()).toMatch(commentData.content);
	expect(await commentElement.innerText()).toMatch(comment.getCreatedAt().toString());
	expect(await commentElement.innerText()).toMatch(comment.getUser().getUsername());
});

test('Many comments created successfully.', async () => {
	const post = await generatePost();

	for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
		const commentData = await generateCommentData(null, post);

		await page.goto(Url.base());
		await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
		await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
		await page.waitForSelector('form#new-comment-form');

		const postIdInputValue = await page.$eval('form#new-comment-form input[name="postId"]', (el) => el.value);

		expect(postIdInputValue).toBe(post.getId().toString());

		await page.fill('form#new-comment-form input[name="userId"]', commentData.userId.toString());
		await page.fill('form#new-comment-form textarea[name="content"]', commentData.content);
		await page.click('form#new-comment-form button');

		await page.waitForSelector('section#comments');

		expect(await page.url()).toBe(Url.path('post/{id}', post.getId()));

		const comment = (await Comment.findByPost(post.getId()))[i];
		const commentElement = await page.$(`.comment[comment-id="${comment.getId()}"]`);

		expect(await commentElement.innerText()).toMatch(commentData.content);
		expect(await commentElement.innerText()).toMatch(comment.getCreatedAt().toString());
		expect(await commentElement.innerText()).toMatch(comment.getUser().getUsername());
	}
});

test.each`
	userId   | content              | message
	${'999'} | ${'Magikarp rocks.'} | ${'User does not exist with ID 999.'}
	${'1'}   | ${''}                | ${'Missing content.'}
`('Comment not created with $message.', async ({
	userId, content, message,
}) => {
	const post = await generatePost();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.waitForSelector('form#new-comment-form');

	const postIdInputValue = await page.$eval('form#new-comment-form input[name="postId"]', (el) => el.value);

	expect(postIdInputValue).toBe(post.getId().toString());

	await page.fill('form#new-comment-form input[name="userId"]', userId);
	await page.fill('form#new-comment-form textarea[name="content"]', content);
	await page.click('form#new-comment-form button');
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot create Comment: ${message}`);
});

test('Comment found by ID.', async () => {
	let comment = await generateComment();

	await page.goto(Url.path('comment/{id}', { id: comment.getId() }));

	const commentElement = await page.$(`.comment[comment-id="${comment.getId()}"]`);
	comment = await Comment.findById(comment.getId());

	expect(await commentElement.innerText()).toMatch(comment.getContent());
	expect(await commentElement.innerText()).toMatch(comment.getCreatedAt().toString());
	expect(await commentElement.innerText()).toMatch(comment.getUser().getUsername());
});

test('Comment not found by wrong ID.', async () => {
	const randomCommentId = generateRandomId();

	await page.goto(Url.path('comment/{id}', randomCommentId));
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot retrieve Comment: Comment does not exist with ID ${randomCommentId}.`);
});

/**
 * The first array represents the comments that will be created in the test.
 * [null] means one comment will be created with null as the parent.
 * [null, 0] means one comment will be created with null as the parent and
 * the next comment will be created with its parent as the comment at index 0. Index
 * 0 being the first comment with null as the parent, in this case.
 *
 * The second array contains the number of comments that should be displayed on
 * the page for when the corresponding comment in the first array is requested.
 * In the first scenario, only one comment is created in the first array so the
 * second array says there should only be one comment displayed for when that comment
 * is requested. In the second scenario, if we request the comment whose parent is null,
 * we should get back 2 comments: the requested comment and its one reply. If we request
 * the second comment, we should only get back one comment: the requested comment and no
 * replies.
 */
test.each`
	commentOrder                         | answers
	${[null]}                            | ${[1]}
	${[null, 0]}                         | ${[2, 1]}
	${[null, 0, 1, 0]}                   | ${[4, 2, 1, 1]}
	${[null, 0, 0, null, 3, 3]}          | ${[3, 1, 1, 3, 1, 1]}
	${[null, 0, 0, 0, 1, 1, 2, 6, 6, 8]} | ${[10, 3, 5, 1, 1, 1, 4, 1, 2, 1]}
`('Comment and replies found.', async ({
	commentOrder, answers,
}) => {
	const post = await generatePost();
	const comments = [];

	for (let i = 0; i < commentOrder.length; i++) {
		if (commentOrder[i] === null) {
			comments.push(await generateComment({ post }));
		}
		else {
			comments.push(await generateComment({ post, replyId: comments[commentOrder[i]].getId() }));
		}
	}

	for (let i = 0; i < comments.length; i++) {
		await page.goto(Url.path('comment/{id}', comments[i].getId()));

		const commentElements = await page.$$('.comment');

		expect(commentElements.length).toBe(answers[i]);

		const commentElement = await page.$(`.comment[comment-id="${comments[i].getId()}"]`);

		expect(await commentElement.innerText()).toMatch(comments[i].getContent());
		expect(await commentElement.innerText()).toMatch(comments[i].getUser().getUsername());
	}
});

test('Comment updated successfully.', async () => {
	const post = await generatePost();
	const comment = await generateComment({ post });
	const { content } = await generateCommentData();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click(`a[href="${Url.path('comment/{id}/edit', comment.getId())}"]`);
	await page.waitForSelector('form#edit-comment-form textarea[name="content"]');

	const contentElement = await page.$('form#edit-comment-form textarea[name="content"]');
	const contentElementValue = await page.$eval('form#edit-comment-form textarea[name="content"]', (el) => el.value);

	expect(contentElementValue).toBe(comment.getContent());

	await contentElement.selectText();
	await page.keyboard.press('Backspace');
	await page.fill('form#edit-comment-form textarea[name="content"]', content);
	await page.click('form#edit-comment-form button');
	await page.waitForSelector('#post-title');

	const commentElement = await page.$(`.comment[comment-id="${comment.getId()}"]`);

	expect(await commentElement.innerText()).toMatch(content);
});

test('Reply updated successfully.', async () => {
	const post = await generatePost();
	const comment = await generateComment({ post });
	const reply = await generateComment({ post, replyId: comment.getId() });
	const { content } = await generateCommentData();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click(`a[href="${Url.path('comment/{id}/edit', reply.getId())}"]`);
	await page.waitForSelector('form#edit-comment-form textarea[name="content"]');

	const contentElement = await page.$('form#edit-comment-form textarea[name="content"]');
	const contentElementValue = await page.$eval('form#edit-comment-form textarea[name="content"]', (el) => el.value);

	expect(contentElementValue).toBe(reply.getContent());

	await contentElement.selectText();
	await page.keyboard.press('Backspace');
	await page.fill('form#edit-comment-form textarea[name="content"]', content);
	await page.click('form#edit-comment-form button');
	await page.waitForSelector('#post-title');

	const commentElement = await page.$(`.comment[comment-id="${reply.getId()}"]`);

	expect(await commentElement.innerText()).toMatch(content);
});

test('Comment not updated with empty form.', async () => {
	const post = await generatePost();
	const comment = await generateComment({ post });

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click(`a[href="${Url.path('comment/{id}/edit', comment.getId())}"]`);
	await page.waitForSelector('form#edit-comment-form textarea[name="content"]');

	const contentElement = await page.$('form#edit-comment-form textarea[name="content"]');
	const contentElementValue = await page.$eval('form#edit-comment-form textarea[name="content"]', (el) => el.value);

	expect(contentElementValue).toBe(comment.getContent());

	await contentElement.selectText();
	await page.keyboard.press('Backspace');
	await page.click('form#edit-comment-form button');
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch('Cannot update Comment: No update parameters were provided.');
});

test('Comment deleted successfully.', async () => {
	const post = await generatePost();
	const comment = await generateComment({ post });

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('category/{id}', post.getCategory().getId())}"]`);
	await page.click(`a[href="${Url.path('post/{id}', post.getId())}"]`);
	await page.click(`.comment[comment-id="${comment.getId()}"] form.delete-comment-form button`);
	await page.waitForSelector('#post-title');

	const commentElement = await page.$(`.comment[comment-id="${comment.getId()}"]`);
	const deletedAt = (await Comment.findById(comment.getId())).getDeletedAt();

	await commentElement.scrollIntoViewIfNeeded();

	await page.pause();

	expect(await commentElement.innerText()).toMatch(`Comment was deleted on ${deletedAt}`);
	expect(await commentElement.$('form#edit-comment-form')).toBeNull();
	expect(await commentElement.$('form#delete-comment-form')).toBeNull();
	expect(await commentElement.$('form#new-comment-form')).toBeNull();
});

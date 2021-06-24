const faker = require('faker');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Post = require('../src/models/Post');
const Database = require('../src/database/Database');

let user;
let category;
let initialPostId;

beforeEach(async () => {
	initialPostId = Math.floor(Math.random() * 100) + 1;
	await Database.truncate(['post'], initialPostId);

	user = await User.create(
		faker.internet.userName(),
		faker.internet.email(),
		faker.internet.password(),
	);

	category = await Category.create(
		user.getId(),
		faker.lorem.words(Math.floor(Math.random() * 5) + 1),
		faker.lorem.sentence(),
	);
});

test('Post was created successfully.', async () => {
	const title = faker.lorem.sentence();
	const type = Math.random() < 0.5 ? 'Text' : 'URL'; // Randomly pick a text post or URL post.
	const content = faker.lorem.paragraph();
	const post = await Post.create(
		user.getId(),
		category.getId(),
		title,
		type,
		content,
	);

	expect(post).toBeInstanceOf(Post);
	expect(post.getId()).toBe(initialPostId);
	expect(post.getTitle()).toBe(title);
	expect(post.getContent()).toBe(content);
	expect(post.getUser()).toBeInstanceOf(User);
	expect(post.getUser().getId()).toBe(user.getId());
	expect(post.getCategory()).toBeInstanceOf(Category);
	expect(post.getCategory().getId()).toBe(category.getId());
});

test('Post was not created with non-existant user.', async () => {
	const post = await Post.create(
		user.getId() + 1,
		category.getId(),
		faker.lorem.sentence(),
		Math.random() < 0.5 ? 'Text' : 'URL',
		faker.lorem.paragraph(),
	);

	expect(post).toBeNull();
});

test('Post was not created with non-existant category.', async () => {
	const post = await Post.create(
		user.getId(),
		category.getId() + 1,
		faker.lorem.sentence(),
		Math.random() < 0.5 ? 'Text' : 'URL',
		faker.lorem.paragraph(),
	);

	expect(post).toBeNull();
});

test('Post was not created with blank title.', async () => {
	const post = await Post.create(
		user.getId(),
		category.getId(),
		'',
		Math.random() < 0.5 ? 'Text' : 'URL',
		faker.lorem.paragraph(),
	);

	expect(post).toBeNull();
});

test('Post was not created with blank type.', async () => {
	const post = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		'',
		faker.lorem.paragraph(),
	);

	expect(post).toBeNull();
});

test('Post was not created with blank content.', async () => {
	const post = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		Math.random() < 0.5 ? 'Text' : 'URL',
		'',
	);

	expect(post).toBeNull();
});

test('Post was found by ID.', async () => {
	const newPost = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		Math.random() < 0.5 ? 'Text' : 'URL',
		faker.lorem.paragraph(),
	);
	const retrievedPost = await Post.findById(newPost.getId());

	expect(retrievedPost.getTitle()).toMatch(newPost.getTitle());
	expect(retrievedPost.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getEditedAt()).toBeNull();
	expect(retrievedPost.getDeletedAt()).toBeNull();
});

test('Post was not found by wrong ID.', async () => {
	const newPost = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		Math.random() < 0.5 ? 'Text' : 'URL',
		faker.lorem.paragraph(),
	);
	const retrievedPost = await Post.findById(newPost.getId() + 1);

	expect(retrievedPost).toBeNull();
});

test('Post (Text) content was updated successfully.', async () => {
	const content = faker.lorem.paragraph();
	const post = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		'Text',
		content,
	);
	const newPostContent = faker.lorem.paragraph();

	post.setContent(newPostContent);
	expect(post.getEditedAt()).toBeNull();

	const wasUpdated = await post.save();

	expect(wasUpdated).toBe(true);

	const retrievedPost = await Post.findById(post.getId());

	expect(retrievedPost.getContent()).toMatch(newPostContent);
	expect(retrievedPost.getContent()).not.toMatch(content);
	expect(retrievedPost.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getEditedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getDeletedAt()).toBeNull();
});

test('Post (Text) was not updated with blank content.', async () => {
	const post = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		'Text',
		faker.lorem.paragraph(),
	);

	post.setContent('');

	const wasUpdated = await post.save();

	expect(wasUpdated).toBe(false);
});

test('Post (URL) was not updated.', async () => {
	const post = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		'URL',
		faker.lorem.paragraph(),
	);

	post.setContent('');

	const wasUpdated = await post.save();

	expect(wasUpdated).toBe(false);
});

test('Post was deleted successfully.', async () => {
	const post = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		Math.random() < 0.5 ? 'Text' : 'URL',
		faker.lorem.paragraph(),
	);

	expect(post.getDeletedAt()).toBeNull();

	const wasDeleted = await post.delete();

	expect(wasDeleted).toBe(true);

	const retrievedPost = await Post.findById(post.getId());

	expect(retrievedPost.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getEditedAt()).toBeNull();
	expect(retrievedPost.getDeletedAt()).toBeInstanceOf(Date);
});

afterAll(async () => {
	await Database.truncate([
		'comment',
		'post',
		'category',
		'user',
		'post_vote',
		'comment_vote',
		'bookmarked_post',
		'bookmarked_comment',
	]);
});

const User = require('../../src/models/User');
const Category = require('../../src/models/Category');
const Post = require('../../src/models/Post');
const {
	generateUser,
	generateCategory,
	generatePost,
	generatePostData,
	truncateDatabase,
} = require('../TestHelper');

let user;
let category;
let initialPostId;

beforeEach(async () => {
	initialPostId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['post'], initialPostId);

	user = await generateUser();
	category = await generateCategory(user);
});

test('Post created successfully.', async () => {
	const { type, title, content } = await generatePostData();
	const post = await generatePost({
		type, user, category, title, content,
	});

	expect(post).toBeInstanceOf(Post);
	expect(post.getId()).toBe(initialPostId);
	expect(post.getTitle()).toBe(title);
	expect(post.getContent()).toBe(content);
	expect(post.getUser()).toBeInstanceOf(User);
	expect(post.getUser().getId()).toBe(user.getId());
	expect(post.getCategory()).toBeInstanceOf(Category);
	expect(post.getCategory().getId()).toBe(category.getId());
});

test('Post not created with non-existant user.', async () => {
	user.setId(999);

	const post = await generatePost({ user });

	expect(post).toBeNull();
});

test('Post not created with non-existant category.', async () => {
	category.setId(999);

	const post = await generatePost({ category });

	expect(post).toBeNull();
});

test('Post not created with blank title.', async () => {
	const post = await generatePost({ title: '' });

	expect(post).toBeNull();
});

test('Post not created with blank type.', async () => {
	const post = await generatePost({ type: '' });

	expect(post).toBeNull();
});

test('Post not created with blank content.', async () => {
	const post = await generatePost({ content: '' });

	expect(post).toBeNull();
});

test('Post found by ID.', async () => {
	const newPost = await generatePost();
	const retrievedPost = await Post.findById(newPost.getId());

	expect(retrievedPost.getId()).toBe(newPost.getId());
	expect(retrievedPost.getTitle()).toMatch(newPost.getTitle());
	expect(retrievedPost.getContent()).toBe(newPost.getContent());
	expect(retrievedPost.getUser()).toBeInstanceOf(User);
	expect(retrievedPost.getUser().getId()).toBe(newPost.getUser().getId());
	expect(retrievedPost.getCategory()).toBeInstanceOf(Category);
	expect(retrievedPost.getCategory().getId()).toBe(newPost.getCategory().getId());
	expect(retrievedPost.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getEditedAt()).toBeNull();
	expect(retrievedPost.getDeletedAt()).toBeNull();
});

test('Post not found by wrong ID.', async () => {
	const newPost = await generatePost();
	const retrievedPost = await Post.findById(newPost.getId() + 1);

	expect(retrievedPost).toBeNull();
});

test('Post (Text) content updated successfully.', async () => {
	const { content } = await generatePostData();
	const post = await generatePost({ type: 'Text', content });
	const { content: newPostContent } = await generatePostData();

	post.setContent(newPostContent);
	expect(post.getEditedAt()).toBeNull();

	const wasUpdated = await post.save();

	expect(wasUpdated).toBe(true);

	const retrievedPost = await Post.findById(post.getId());

	expect(retrievedPost.getContent()).toMatch(newPostContent);
	expect(retrievedPost.getContent()).not.toMatch(content);
	expect(retrievedPost.getUser()).toBeInstanceOf(User);
	expect(retrievedPost.getUser().getId()).toBe(post.getUser().getId());
	expect(retrievedPost.getCategory()).toBeInstanceOf(Category);
	expect(retrievedPost.getCategory().getId()).toBe(post.getCategory().getId());
	expect(retrievedPost.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getEditedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getDeletedAt()).toBeNull();
});

test('Post (Text) not updated with blank content.', async () => {
	const post = await generatePost({ type: 'Text' });

	post.setContent('');

	const wasUpdated = await post.save();

	expect(wasUpdated).toBe(false);
});

test('Post (URL) not updated.', async () => {
	const post = await generatePost({ type: 'URL' });

	post.setContent('https://pokemon.com');

	const wasUpdated = await post.save();

	expect(wasUpdated).toBe(false);
});

test('Post deleted successfully.', async () => {
	const post = await generatePost();

	expect(post.getDeletedAt()).toBeNull();

	const wasDeleted = await post.remove();

	expect(wasDeleted).toBe(true);

	const retrievedPost = await Post.findById(post.getId());

	expect(retrievedPost.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedPost.getEditedAt()).toBeNull();
	expect(retrievedPost.getDeletedAt()).toBeInstanceOf(Date);
});

afterAll(async () => {
	await truncateDatabase();
});

const faker = require('faker');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');
const Database = require('../src/database/Database');

let user;
let category;
let post;
let initialCommentId;

beforeEach(async () => {
	initialCommentId = Math.floor(Math.random() * 100) + 1;
	await Database.truncate(['comment'], initialCommentId);

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

	post = await Post.create(
		user.getId(),
		category.getId(),
		faker.lorem.sentence(),
		Math.random() < 0.5 ? 'Text' : 'URL',
		faker.lorem.paragraph(),
	);
});

test('Comment was created successfully.', async () => {
	const content = faker.lorem.paragraph();
	const comment = await Comment.create(
		user.getId(),
		post.getId(),
		content,
	);

	expect(comment).toBeInstanceOf(Comment);
	expect(comment.getId()).toBe(initialCommentId);
	expect(comment.getContent()).toBe(content);
	expect(comment.getUser()).toBeInstanceOf(User);
	expect(comment.getUser().getId()).toBe(user.getId());
	expect(comment.getPost()).toBeInstanceOf(Post);
	expect(comment.getPost().getId()).toBe(post.getId());
	expect(comment.getRepliedTo()).toBeNull();
});

test('Comment reply was created successfully.', async () => {
	const comment = await Comment.create(
		user.getId(),
		post.getId(),
		faker.lorem.paragraph(),
	);
	const reply = await Comment.create(
		user.getId(),
		post.getId(),
		faker.lorem.paragraph(),
		comment.getId(),
	);

	expect(reply).toBeInstanceOf(Comment);
	expect(reply.getId()).toBe(comment.getId() + 1);
	expect(reply.getRepliedTo()).toBeInstanceOf(Comment);
	expect(reply.getRepliedTo().getId()).toBe(comment.getId());
});

test('Comment was not created with non-existant user.', async () => {
	const comment = await Comment.create(
		user.getId() + 1,
		post.getId(),
		faker.lorem.paragraph(),
	);

	expect(comment).toBeNull();
});

test('Comment was not created with non-existant post.', async () => {
	const comment = await Comment.create(
		user.getId(),
		post.getId() + 1,
		faker.lorem.paragraph(),
	);

	expect(comment).toBeNull();
});

test('Comment was not created with blank content.', async () => {
	const comment = await Comment.create(
		user.getId(),
		post.getId(),
		'',
	);

	expect(comment).toBeNull();
});

test('Comment was found by ID.', async () => {
	const newComment = await Comment.create(
		user.getId(),
		post.getId(),
		faker.lorem.paragraph(),
	);
	const retrievedComment = await Comment.findById(newComment.getId());

	expect(retrievedComment.getContent()).toMatch(newComment.getContent());
	expect(retrievedComment.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedComment.getEditedAt()).toBeNull();
	expect(retrievedComment.getDeletedAt()).toBeNull();
});

test('Comment was not found by wrong ID.', async () => {
	const newComment = await Comment.create(
		user.getId(),
		post.getId(),
		faker.lorem.paragraph(),
	);
	const retrievedComment = await Comment.findById(newComment.getId() + 1);

	expect(retrievedComment).toBeNull();
});

test('Comment was updated successfully.', async () => {
	const content = faker.lorem.paragraph();
	const comment = await Comment.create(
		user.getId(),
		post.getId(),
		content,
	);
	const newCommentContent = faker.lorem.paragraph();

	comment.setContent(newCommentContent);
	expect(comment.getEditedAt()).toBeNull();

	const wasUpdated = await comment.save();

	expect(wasUpdated).toBe(true);

	const retrievedComment = await Comment.findById(comment.getId());

	expect(retrievedComment.getContent()).toMatch(newCommentContent);
	expect(retrievedComment.getContent()).not.toMatch(content);
	expect(retrievedComment.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedComment.getEditedAt()).toBeInstanceOf(Date);
	expect(retrievedComment.getDeletedAt()).toBeNull();
});

test('Comment was not updated with blank content.', async () => {
	const comment = await Comment.create(
		user.getId(),
		post.getId(),
		faker.lorem.paragraph(),
	);

	comment.setContent('');

	const wasUpdated = await comment.save();

	expect(wasUpdated).toBe(false);
});

test('Comment was deleted successfully.', async () => {
	const comment = await Comment.create(
		user.getId(),
		post.getId(),
		faker.lorem.paragraph(),
	);

	expect(comment.getDeletedAt()).toBeNull();

	const wasDeleted = await comment.delete();

	expect(wasDeleted).toBe(true);

	const retrievedComment = await Comment.findById(comment.getId());

	expect(retrievedComment.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedComment.getEditedAt()).toBeNull();
	expect(retrievedComment.getDeletedAt()).toBeInstanceOf(Date);
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

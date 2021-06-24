const User = require('../../src/models/User');
const Post = require('../../src/models/Post');
const Comment = require('../../src/models/Comment');
const {
	generateUser,
	generatePost,
	generateCommentData,
	generateComment,
	truncateDatabase,
} = require('../TestHelper');

let user;
let post;
let initialCommentId;

beforeEach(async () => {
	initialCommentId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['comment'], initialCommentId);

	user = await generateUser();
	post = await generatePost(user);
});

test('Comment created successfully.', async () => {
	const { content } = await generateCommentData();
	const comment = await generateComment({ user, post, content });

	expect(comment).toBeInstanceOf(Comment);
	expect(comment.getId()).toBe(initialCommentId);
	expect(comment.getContent()).toBe(content);
	expect(comment.getUser()).toBeInstanceOf(User);
	expect(comment.getUser().getId()).toBe(user.getId());
	expect(comment.getPost()).toBeInstanceOf(Post);
	expect(comment.getPost().getId()).toBe(post.getId());
	expect(comment.getRepliedTo()).toBeNull();
});

test('Comment reply created successfully.', async () => {
	const comment = await generateComment({ user, post });
	const reply = await generateComment({ reply: comment });

	expect(reply).toBeInstanceOf(Comment);
	expect(reply.getId()).toBe(comment.getId() + 1);
	expect(reply.getRepliedTo()).toBeInstanceOf(Comment);
	expect(reply.getRepliedTo().getId()).toBe(comment.getId());
});

test('Comment not created with non-existant user.', async () => {
	user.setId(999);

	const comment = await generateComment({ user });

	expect(comment).toBeNull();
});

test('Comment not created with non-existant post.', async () => {
	post.setId(999);

	const comment = await generateComment({ post });

	expect(comment).toBeNull();
});

test('Comment not created with blank content.', async () => {
	const comment = await generateComment({ content: '' });

	expect(comment).toBeNull();
});

test('Comment found by ID.', async () => {
	const newComment = await generateComment();
	const retrievedComment = await Comment.findById(newComment.getId());

	expect(retrievedComment.getId()).toBe(newComment.getId());
	expect(retrievedComment.getContent()).toBe(newComment.getContent());
	expect(retrievedComment.getUser()).toBeInstanceOf(User);
	expect(retrievedComment.getUser().getId()).toBe(newComment.getUser().getId());
	expect(retrievedComment.getPost()).toBeInstanceOf(Post);
	expect(retrievedComment.getPost().getId()).toBe(newComment.getPost().getId());
	expect(retrievedComment.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedComment.getEditedAt()).toBeNull();
	expect(retrievedComment.getDeletedAt()).toBeNull();
});

test('Comment not found by wrong ID.', async () => {
	const newComment = await generateComment();
	const retrievedComment = await Comment.findById(newComment.getId() + 1);

	expect(retrievedComment).toBeNull();
});

test('Comment updated successfully.', async () => {
	const { content } = await generateCommentData();
	const comment = await generateComment({ user, post, content });
	const { content: newCommentContent } = await generateCommentData();

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

test('Comment not updated with blank content.', async () => {
	const comment = await generateComment();

	comment.setContent('');

	const wasUpdated = await comment.save();

	expect(wasUpdated).toBe(false);
});

test('Comment deleted successfully.', async () => {
	const comment = await generateComment();

	expect(comment.getDeletedAt()).toBeNull();

	const wasDeleted = await comment.remove();

	expect(wasDeleted).toBe(true);

	const retrievedComment = await Comment.findById(comment.getId());

	expect(retrievedComment.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedComment.getEditedAt()).toBeNull();
	expect(retrievedComment.getDeletedAt()).toBeInstanceOf(Date);
});

afterAll(async () => {
	await truncateDatabase();
});

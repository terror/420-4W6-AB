const {
	generateCommentData,
	generateComment,
	makeHttpRequest,
	generateRandomId,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Comment created successfully.', async () => {
	const initialCommentId = generateRandomId();
	await truncateDatabase(['comment'], initialCommentId);

	const commentData = await generateCommentData();
	const [statusCode, response] = await makeHttpRequest('POST', '/comment', commentData);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment created successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('post')).toBe(true);
	expect(response.payload.id).toBe(initialCommentId);
	expect(response.payload.content).toBe(commentData.content);
	expect(response.payload.user.id).toBe(commentData.userId);
	expect(response.payload.post.id).toBe(commentData.postId);
	expect(response.payload.createdAt).toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Comment not created with non-existant user.', async () => {
	const commentData = await generateCommentData();

	commentData.userId = generateRandomId(commentData.userId);

	const [statusCode, response] = await makeHttpRequest('POST', '/comment', commentData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot create Comment: User does not exist with ID ${commentData.userId}.`);
	expect(response.payload).toMatchObject({});
});

test('Comment not created with non-existant post.', async () => {
	const commentData = await generateCommentData();

	commentData.postId = generateRandomId(commentData.postId);

	const [statusCode, response] = await makeHttpRequest('POST', '/comment', commentData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot create Comment: Post does not exist with ID ${commentData.postId}.`);
	expect(response.payload).toMatchObject({});
});

test('Comment not created with blank content.', async () => {
	const commentData = await generateCommentData();

	commentData.content = '';

	const [statusCode, response] = await makeHttpRequest('POST', '/comment', commentData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Cannot create Comment: Missing content.');
	expect(response.payload).toMatchObject({});
});

test('Comment found by ID.', async () => {
	const comment = await generateComment();
	const [statusCode, response] = await makeHttpRequest('GET', `/comment/${comment.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment retrieved successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('post')).toBe(true);
	expect(response.payload.id).toBe(comment.getId());
	expect(response.payload.content).toBe(comment.getContent());
	expect(response.payload.user.id).toBe(comment.getUser().getId());
	expect(response.payload.post.id).toBe(comment.getPost().getId());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Comment not found by wrong ID.', async () => {
	const commentId = generateRandomId();
	const [statusCode, response] = await makeHttpRequest('GET', `/comment/${commentId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot retrieve Comment: Comment does not exist with ID ${commentId}.`);
	expect(response.payload).toMatchObject({});
});

test('Comment updated successfully.', async () => {
	const comment = await generateComment({ type: 'Text' });
	const { content: newCommentContent } = await generateCommentData();
	let [statusCode, response] = await makeHttpRequest('PUT', `/comment/${comment.getId()}`, { content: newCommentContent });

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment updated successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('post')).toBe(true);
	expect(response.payload.id).toBe(comment.getId());
	expect(response.payload.content).toBe(newCommentContent);
	expect(response.payload.content).not.toBe(comment.getContent());
	expect(response.payload.user.id).toBe(comment.getUser().getId());
	expect(response.payload.post.id).toBe(comment.getPost().getId());

	[statusCode, response] = await makeHttpRequest('GET', `/comment/${comment.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.content).toBe(newCommentContent);
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).not.toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Comment not updated with non-existant ID.', async () => {
	const commentId = generateRandomId();
	const [statusCode, response] = await makeHttpRequest('PUT', `/comment/${commentId}`, { content: 'New content!' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot update Comment: Comment does not exist with ID ${commentId}.`);
	expect(response.payload).toMatchObject({});
});

test('Comment not updated with blank content.', async () => {
	const comment = await generateComment({ type: 'Text' });
	const [statusCode, response] = await makeHttpRequest('PUT', `/comment/${comment.getId()}`, { content: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Cannot update Comment: No update parameters were provided.');
	expect(response.payload).toMatchObject({});
});

test('Comment deleted successfully.', async () => {
	const comment = await generateComment();
	let [statusCode, response] = await makeHttpRequest('DELETE', `/comment/${comment.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment deleted successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('post')).toBe(true);
	expect(response.payload.id).toBe(comment.getId());
	expect(response.payload.content).toBe(comment.getContent());
	expect(response.payload.user.id).toBe(comment.getUser().getId());
	expect(response.payload.post.id).toBe(comment.getPost().getId());

	[statusCode, response] = await makeHttpRequest('GET', `/comment/${comment.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.content).toBe(comment.getContent());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).not.toBeNull();
});

test('Comment not deleted with non-existant ID.', async () => {
	const commentId = generateRandomId();
	const [statusCode, response] = await makeHttpRequest('DELETE', `/comment/${commentId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe(`Cannot delete Comment: Comment does not exist with ID ${commentId}.`);
	expect(response.payload).toMatchObject({});
});

afterAll(async () => {
	await truncateDatabase();
});

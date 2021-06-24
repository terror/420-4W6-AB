const {
	generateCommentData,
	generateComment,
	makeHttpRequest,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Comment created successfully.', async () => {
	const initialCommentId = Math.floor(Math.random() * 100) + 1;
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
	expect(response.payload.title).toBe(commentData.title);
	expect(response.payload.content).toBe(commentData.content);
	expect(response.payload.user.id).toBe(commentData.userId);
	expect(response.payload.post.id).toBe(commentData.postId);
	expect(response.payload.createdAt).toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Comment not created with non-existant user.', async () => {
	const commentData = await generateCommentData();

	commentData.userId = 999;

	const [statusCode, response] = await makeHttpRequest('POST', '/comment', commentData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment not created.');
	expect(response.payload).toMatchObject({});
});

test('Comment not created with non-existant post.', async () => {
	const commentData = await generateCommentData();

	commentData.postId = 999;

	const [statusCode, response] = await makeHttpRequest('POST', '/comment', commentData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment not created.');
	expect(response.payload).toMatchObject({});
});

test('Comment not created with blank content.', async () => {
	const commentData = await generateCommentData();

	commentData.content = '';

	const [statusCode, response] = await makeHttpRequest('POST', '/comment', commentData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment not created.');
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
	const commentId = Math.floor(Math.random() * 100) + 1;
	const [statusCode, response] = await makeHttpRequest('GET', `/comment/${commentId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment not retrieved.');
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
	const [statusCode, response] = await makeHttpRequest('PUT', '/comment/1', { content: 'New content!' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment not updated.');
	expect(response.payload).toMatchObject({});
});

test('Comment not updated with blank content.', async () => {
	const comment = await generateComment({ type: 'Text' });
	const [statusCode, response] = await makeHttpRequest('PUT', `/comment/${comment.getId()}`, { content: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment not updated.');
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
	const [statusCode, response] = await makeHttpRequest('DELETE', '/comment/1');

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Comment not deleted.');
	expect(response.payload).toMatchObject({});
});

afterAll(async () => {
	await truncateDatabase();
});

const {
	generatePostData,
	generatePost,
	makeHttpRequest,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Post created successfully.', async () => {
	const initialPostId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['post'], initialPostId);

	const postData = await generatePostData();
	const [statusCode, response] = await makeHttpRequest('POST', '/post', postData);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post created successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('category')).toBe(true);
	expect(response.payload.id).toBe(initialPostId);
	expect(response.payload.title).toBe(postData.title);
	expect(response.payload.content).toBe(postData.content);
	expect(response.payload.user.id).toBe(postData.userId);
	expect(response.payload.category.id).toBe(postData.categoryId);
	expect(response.payload.createdAt).toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Post not created with non-existant user.', async () => {
	const postData = await generatePostData();

	postData.userId = 999;

	const [statusCode, response] = await makeHttpRequest('POST', '/post', postData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not created.');
	expect(response.payload).toMatchObject({});
});

test('Post not created with non-existant category.', async () => {
	const postData = await generatePostData();

	postData.categoryId = 999;

	const [statusCode, response] = await makeHttpRequest('POST', '/post', postData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not created.');
	expect(response.payload).toMatchObject({});
});

test('Post not created with blank title.', async () => {
	const postData = await generatePostData();

	postData.title = '';

	const [statusCode, response] = await makeHttpRequest('POST', '/post', postData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not created.');
	expect(response.payload).toMatchObject({});
});

test('Post not created with blank type.', async () => {
	const postData = await generatePostData();

	postData.type = '';

	const [statusCode, response] = await makeHttpRequest('POST', '/post', postData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not created.');
	expect(response.payload).toMatchObject({});
});

test('Post not created with blank content.', async () => {
	const postData = await generatePostData();

	postData.content = '';

	const [statusCode, response] = await makeHttpRequest('POST', '/post', postData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not created.');
	expect(response.payload).toMatchObject({});
});

test('Post found by ID.', async () => {
	const post = await generatePost();
	const [statusCode, response] = await makeHttpRequest('GET', `/post/${post.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post retrieved successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('category')).toBe(true);
	expect(response.payload.id).toBe(post.getId());
	expect(response.payload.title).toBe(post.getTitle());
	expect(response.payload.content).toBe(post.getContent());
	expect(response.payload.user.id).toBe(post.getUser().getId());
	expect(response.payload.category.id).toBe(post.getCategory().getId());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Post not found by wrong ID.', async () => {
	const postId = Math.floor(Math.random() * 100) + 1;
	const [statusCode, response] = await makeHttpRequest('GET', `/post/${postId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not retrieved.');
	expect(response.payload).toMatchObject({});
});

test('Post (Text) content updated successfully.', async () => {
	const post = await generatePost({ type: 'Text' });
	const { content: newPostContent } = await generatePostData();
	let [statusCode, response] = await makeHttpRequest('PUT', `/post/${post.getId()}`, { content: newPostContent });

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post updated successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('category')).toBe(true);
	expect(response.payload.id).toBe(post.getId());
	expect(response.payload.content).toBe(newPostContent);
	expect(response.payload.content).not.toBe(post.getContent());
	expect(response.payload.user.id).toBe(post.getUser().getId());
	expect(response.payload.category.id).toBe(post.getCategory().getId());

	[statusCode, response] = await makeHttpRequest('GET', `/post/${post.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.content).toBe(newPostContent);
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).not.toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('Post (Text) not updated with non-existant ID.', async () => {
	const [statusCode, response] = await makeHttpRequest('PUT', '/post/1', { content: 'New content!' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not updated.');
	expect(response.payload).toMatchObject({});
});

test('Post (Text) not updated with blank content.', async () => {
	const post = await generatePost({ type: 'Text' });
	const [statusCode, response] = await makeHttpRequest('PUT', `/post/${post.getId()}`, { content: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not updated.');
	expect(response.payload).toMatchObject({});
});

test('Post (URL) not updated.', async () => {
	const post = await generatePost({ type: 'URL' });
	const [statusCode, response] = await makeHttpRequest('PUT', `/post/${post.getId()}`, { content: 'https://pokemon.com' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not updated.');
	expect(response.payload).toMatchObject({});
});

test('Post deleted successfully.', async () => {
	const post = await generatePost();
	let [statusCode, response] = await makeHttpRequest('DELETE', `/post/${post.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post deleted successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('title')).toBe(true);
	expect(Object.keys(response.payload).includes('content')).toBe(true);
	expect(Object.keys(response.payload).includes('user')).toBe(true);
	expect(Object.keys(response.payload).includes('category')).toBe(true);
	expect(response.payload.id).toBe(post.getId());
	expect(response.payload.title).toBe(post.getTitle());
	expect(response.payload.content).toBe(post.getContent());
	expect(response.payload.user.id).toBe(post.getUser().getId());
	expect(response.payload.category.id).toBe(post.getCategory().getId());

	[statusCode, response] = await makeHttpRequest('GET', `/post/${post.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.title).toBe(post.getTitle());
	expect(response.payload.content).toBe(post.getContent());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).not.toBeNull();
});

test('Post not deleted with non-existant ID.', async () => {
	const [statusCode, response] = await makeHttpRequest('DELETE', '/post/1');

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Post not deleted.');
	expect(response.payload).toMatchObject({});
});

afterAll(async () => {
	await truncateDatabase();
});

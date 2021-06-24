const {
	generateUserData,
	generateUser,
	makeHttpRequest,
	truncateDatabase,
} = require('../TestHelper');

beforeEach(async () => {
	await truncateDatabase();
});

test('Homepage was retrieved successfully.', async () => {
	const [statusCode, response] = await makeHttpRequest('GET', '/');

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Homepage!');
	expect(response.payload).toMatchObject({});
});

test('Invalid path returned error.', async () => {
	const [statusCode, response] = await makeHttpRequest('GET', '/userr');

	expect(statusCode).toBe(404);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Invalid request path!');
	expect(response.payload).toMatchObject({});
});

test('Invalid request method returned error.', async () => {
	const [statusCode, response] = await makeHttpRequest('PATCH', '/user');

	expect(statusCode).toBe(405);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Invalid request method!');
	expect(response.payload).toMatchObject({});
});

test('User created successfully.', async () => {
	const initialUserId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['user'], initialUserId);

	const userData = generateUserData();
	const [statusCode, response] = await makeHttpRequest('POST', '/user', userData);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User created successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('username')).toBe(true);
	expect(Object.keys(response.payload).includes('email')).toBe(true);
	expect(response.payload.id).toBe(initialUserId);
	expect(response.payload.username).toBe(userData.username);
	expect(response.payload.email).toBe(userData.email);
	expect(response.payload.createdAt).toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('User not created with blank username.', async () => {
	const userData = await generateUserData('');
	const [statusCode, response] = await makeHttpRequest('POST', '/user', userData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not created.');
	expect(response.payload).toMatchObject({});
});

test('User not created with blank email.', async () => {
	const userData = await generateUserData(null, '');
	const [statusCode, response] = await makeHttpRequest('POST', '/user', userData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not created.');
	expect(response.payload).toMatchObject({});
});

test('User not created with blank password.', async () => {
	const userData = await generateUserData(null, null, '');
	const [statusCode, response] = await makeHttpRequest('POST', '/user', userData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not created.');
	expect(response.payload).toMatchObject({});
});

test('User not created with duplicate username.', async () => {
	const user = await generateUser();
	const userData = await generateUserData(user.getUsername());
	const [statusCode, response] = await makeHttpRequest('POST', '/user', userData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not created.');
	expect(response.payload).toMatchObject({});
});

test('User not created with duplicate email.', async () => {
	const user = await generateUser();
	const userData = await generateUserData(null, user.getEmail());
	const [statusCode, response] = await makeHttpRequest('POST', '/user', userData);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not created.');
	expect(response.payload).toMatchObject({});
});

test('All users found.', async () => {
	let users = [];
	const numberOfUsers = Math.floor(Math.random() * 10) + 1;

	for (let i = 0; i < numberOfUsers; i++) {
		users.push(generateUser());
	}

	users = await Promise.all(users);

	users.sort((userA, userB) => userA.getId() - userB.getId());

	const [statusCode, response] = await makeHttpRequest('GET', '/user');

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('Users retrieved successfully!');
	expect(Array.isArray(response.payload)).toBe(true);
	expect(response.payload.length).toBe(numberOfUsers);

	response.payload.forEach((user, index) => {
		expect(Object.keys(user).includes('id')).toBe(true);
		expect(Object.keys(user).includes('username')).toBe(true);
		expect(Object.keys(user).includes('email')).toBe(true);
		expect(user.id).toBe(users[index].getId());
		expect(user.username).toBe(users[index].getUsername());
		expect(user.email).toBe(users[index].getEmail());
		expect(user.createdAt).not.toBeNull();
		expect(user.editedAt).toBeNull();
		expect(user.deletedAt).toBeNull();
	});
});

test('User found by ID.', async () => {
	const user = await generateUser();
	const [statusCode, response] = await makeHttpRequest('GET', `/user/${user.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User retrieved successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('username')).toBe(true);
	expect(Object.keys(response.payload).includes('email')).toBe(true);
	expect(response.payload.id).toBe(user.getId());
	expect(response.payload.username).toBe(user.getUsername());
	expect(response.payload.email).toBe(user.getEmail());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('User not found by wrong ID.', async () => {
	const userId = Math.floor(Math.random() * 100) + 1;
	const [statusCode, response] = await makeHttpRequest('GET', `/user/${userId}`);

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not retrieved.');
	expect(response.payload).toMatchObject({});
});

test('User updated successfully.', async () => {
	const user = await generateUser();
	const newUserData = generateUserData();
	let [statusCode, response] = await makeHttpRequest('PUT', `/user/${user.getId()}`, newUserData);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User updated successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('username')).toBe(true);
	expect(Object.keys(response.payload).includes('email')).toBe(true);
	expect(response.payload.id).toBe(user.getId());
	expect(response.payload.username).toBe(newUserData.username);
	expect(response.payload.email).toBe(newUserData.email);
	expect(response.payload.username).not.toBe(user.getUsername());
	expect(response.payload.email).not.toBe(user.getEmail());

	[statusCode, response] = await makeHttpRequest('GET', `/user/${user.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.username).toBe(newUserData.username);
	expect(response.payload.email).toBe(newUserData.email);
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).not.toBeNull();
	expect(response.payload.deletedAt).toBeNull();
});

test('User not updated with non-existant ID.', async () => {
	const [statusCode, response] = await makeHttpRequest('PUT', '/user/1', { username: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not updated.');
	expect(response.payload).toMatchObject({});
});

test('User not updated with blank username.', async () => {
	const user = await generateUser();
	const [statusCode, response] = await makeHttpRequest('PUT', `/user/${user.getId()}`, { username: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not updated.');
	expect(response.payload).toMatchObject({});
});

test('User not updated with blank email.', async () => {
	const user = await generateUser();
	const [statusCode, response] = await makeHttpRequest('PUT', `/user/${user.getId()}`, { email: '' });

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not updated.');
	expect(response.payload).toMatchObject({});
});

test('User deleted successfully.', async () => {
	const user = await generateUser();
	let [statusCode, response] = await makeHttpRequest('DELETE', `/user/${user.getId()}`);

	expect(statusCode).toBe(200);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User deleted successfully!');
	expect(Object.keys(response.payload).includes('id')).toBe(true);
	expect(Object.keys(response.payload).includes('username')).toBe(true);
	expect(Object.keys(response.payload).includes('email')).toBe(true);
	expect(response.payload.id).toBe(user.getId());
	expect(response.payload.username).toBe(user.getUsername());
	expect(response.payload.email).toBe(user.getEmail());

	[statusCode, response] = await makeHttpRequest('GET', `/user/${user.getId()}`);

	expect(statusCode).toBe(200);
	expect(response.payload.username).toBe(user.getUsername());
	expect(response.payload.email).toBe(user.getEmail());
	expect(response.payload.createdAt).not.toBeNull();
	expect(response.payload.editedAt).toBeNull();
	expect(response.payload.deletedAt).not.toBeNull();
});

test('User not deleted with non-existant ID.', async () => {
	const [statusCode, response] = await makeHttpRequest('DELETE', '/user/1');

	expect(statusCode).toBe(400);
	expect(Object.keys(response).includes('message')).toBe(true);
	expect(Object.keys(response).includes('payload')).toBe(true);
	expect(response.message).toBe('User not deleted.');
	expect(response.payload).toMatchObject({});
});

afterAll(async () => {
	await truncateDatabase();
});

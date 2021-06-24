const faker = require('faker');
const User = require('../../src/models/User');
const {
	generateUserData,
	generateUser,
	truncateDatabase,
} = require('../TestHelper');

let initialUserId;

beforeEach(async () => {
	initialUserId = Math.floor(Math.random() * 100) + 1;
	await truncateDatabase(['user'], initialUserId);
});

test('User created successfully.', async () => {
	const { username, email, password } = generateUserData();
	const user = await generateUser(username, email, password);

	expect(user).toBeInstanceOf(User);
	expect(user.getId()).toBe(initialUserId);
	expect(user.getUsername()).toBe(username);
	expect(user.getEmail()).toBe(email);
});

test('User not created with blank username.', async () => {
	const user = await generateUser('');

	expect(user).toBeNull();
});

test('User not created with blank email.', async () => {
	const user = await generateUser(null, '');

	expect(user).toBeNull();
});

test('User not created with blank password.', async () => {
	const user = await generateUser(null, null, '');

	expect(user).toBeNull();
});

test('User not created with duplicate username.', async () => {
	const { username } = generateUserData();

	await generateUser(username);

	const user = await generateUser(username);

	expect(user).toBeNull();
});

test('User not created with duplicate email.', async () => {
	const { email } = generateUserData();

	await generateUser(null, email);

	const user = await generateUser(null, email);

	expect(user).toBeNull();
});

test('User found by ID.', async () => {
	const newUser = await generateUser();
	const retrievedUser = await User.findById(newUser.getId());

	expect(retrievedUser.getUsername()).toMatch(newUser.getUsername());
	expect(retrievedUser.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getEditedAt()).toBeNull();
	expect(retrievedUser.getDeletedAt()).toBeNull();
});

test('User not found by wrong ID.', async () => {
	const newUser = await generateUser();
	const retrievedUser = await User.findById(newUser.getId() + 1);

	expect(retrievedUser).toBeNull();
});

test('User found by email.', async () => {
	const newUser = await generateUser();
	const retrievedUser = await User.findByEmail(newUser.getEmail());

	expect(retrievedUser.getUsername()).toMatch(newUser.getUsername());
});

test('User not found by wrong email.', async () => {
	const newUser = await generateUser();
	const retrievedUser = await User.findByEmail(`${newUser.getEmail()}.wrong`);

	expect(retrievedUser).toBeNull();
});

test('User updated successfully.', async () => {
	const { username } = generateUserData();
	const newUser = await generateUser(username);
	const { username: newUsername } = generateUserData();

	newUser.setUsername(newUsername);
	expect(newUser.getEditedAt()).toBeNull();

	const wasUpdated = await newUser.save();

	expect(wasUpdated).toBe(true);

	const retrievedUser = await User.findById(newUser.getId());

	expect(retrievedUser.getUsername()).toMatch(newUsername);
	expect(retrievedUser.getUsername()).not.toMatch(username);
	expect(retrievedUser.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getEditedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getDeletedAt()).toBeNull();
});

test('User avatar updated successfully.', async () => {
	const newUser = await generateUser();
	const newAvatar = faker.image.image();

	newUser.setAvatar(newAvatar);
	expect(newUser.getEditedAt()).toBeNull();

	const wasUpdated = await newUser.save();

	expect(wasUpdated).toBe(true);

	const retrievedUser = await User.findById(newUser.getId());

	expect(retrievedUser.getAvatar()).toMatch(newAvatar);
	expect(retrievedUser.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getEditedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getDeletedAt()).toBeNull();
});

test('User not updated with blank username.', async () => {
	const user = await generateUser();

	user.setUsername('');

	const wasUpdated = await user.save();

	expect(wasUpdated).toBe(false);
});

test('User not updated with blank email.', async () => {
	const user = await generateUser();

	user.setEmail('');

	const wasUpdated = await user.save();

	expect(wasUpdated).toBe(false);
});

test('User deleted successfully.', async () => {
	const user = await generateUser();

	expect(user.getDeletedAt()).toBeNull();

	const wasDeleted = await user.remove();

	expect(wasDeleted).toBe(true);

	const retrievedUser = await User.findById(user.getId());

	expect(retrievedUser.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getEditedAt()).toBeNull();
	expect(retrievedUser.getDeletedAt()).toBeInstanceOf(Date);
});

afterAll(async () => {
	await truncateDatabase();
});

const faker = require('faker');
const User = require('../src/models/User');
const Database = require('../src/database/Database');

let initialUserId;

beforeEach(async () => {
	initialUserId = Math.floor(Math.random() * 100) + 1;
	await Database.truncate(['user'], initialUserId);
});

test('User was created successfully.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = faker.internet.password();
	const user = await User.create(username, email, password);

	expect(user).toBeInstanceOf(User);
	expect(user.getId()).toBe(initialUserId);
	expect(user.getUsername()).toBe(username);
	expect(user.getEmail()).toBe(email);
});

test('User was not created with blank username.', async () => {
	const username = '';
	const email = faker.internet.email();
	const password = faker.internet.password();
	const user = await User.create(username, email, password);

	expect(user).toBeNull();
});

test('User was not created with blank email.', async () => {
	const username = faker.internet.userName();
	const email = '';
	const password = faker.internet.password();
	const user = await User.create(username, email, password);

	expect(user).toBeNull();
});

test('User was not created with blank password.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = '';
	const user = await User.create(username, email, password);

	expect(user).toBeNull();
});

test('User was not created with duplicate username.', async () => {
	const username = faker.internet.userName();

	await User.create(
		username,
		faker.internet.email(),
		faker.internet.password(),
	);

	const user = await User.create(
		username,
		faker.internet.email(),
		faker.internet.password(),
	);

	expect(user).toBeNull();
});

test('User was not created with duplicate email.', async () => {
	const email = faker.internet.email();

	await User.create(
		faker.internet.userName(),
		email,
		faker.internet.password(),
	);

	const user = await User.create(
		faker.internet.userName(),
		email,
		faker.internet.password(),
	);

	expect(user).toBeNull();
});

test('User was found by ID.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = faker.internet.password();
	const newUser = await User.create(username, email, password);
	const retrievedUser = await User.findById(newUser.getId());

	expect(retrievedUser.getUsername()).toMatch(newUser.getUsername());
	expect(retrievedUser.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getEditedAt()).toBeNull();
	expect(retrievedUser.getDeletedAt()).toBeNull();
});

test('User was not found by wrong ID.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = faker.internet.password();
	const newUser = await User.create(username, email, password);
	const retrievedUser = await User.findById(newUser.getId() + 1);

	expect(retrievedUser).toBeNull();
});

test('User was found by email.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = faker.internet.password();
	const newUser = await User.create(username, email, password);
	const retrievedUser = await User.findByEmail(newUser.getEmail());

	expect(retrievedUser.getUsername()).toMatch(newUser.getUsername());
});

test('User was not found by wrong email.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = faker.internet.password();
	const newUser = await User.create(username, email, password);
	const retrievedUser = await User.findByEmail(`${newUser.getEmail()}.wrong`);

	expect(retrievedUser).toBeNull();
});

test('User was updated successfully.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = faker.internet.password();
	const newUser = await User.create(username, email, password);
	const newUsername = faker.internet.userName();

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

test('User avatar was updated successfully.', async () => {
	const username = faker.internet.userName();
	const email = faker.internet.email();
	const password = faker.internet.password();
	const newUser = await User.create(username, email, password);
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

test('User was not updated with blank username.', async () => {
	const user = await User.create(
		faker.internet.userName(),
		faker.internet.email(),
		faker.internet.password(),
	);

	user.setUsername('');

	const wasUpdated = await user.save();

	expect(wasUpdated).toBe(false);
});

test('User was not updated with blank email.', async () => {
	const user = await User.create(
		faker.internet.userName(),
		faker.internet.email(),
		faker.internet.password(),
	);

	user.setEmail('');

	const wasUpdated = await user.save();

	expect(wasUpdated).toBe(false);
});

test('User was deleted successfully.', async () => {
	const user = await User.create(
		faker.internet.userName(),
		faker.internet.email(),
		faker.internet.password(),
	);

	expect(user.getDeletedAt()).toBeNull();

	const wasDeleted = await user.delete();

	expect(wasDeleted).toBe(true);

	const retrievedUser = await User.findById(user.getId());

	expect(retrievedUser.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedUser.getEditedAt()).toBeNull();
	expect(retrievedUser.getDeletedAt()).toBeInstanceOf(Date);
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

const faker = require('faker');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Database = require('../src/database/Database');

let user;
let initialCategoryId;

beforeEach(async () => {
	initialCategoryId = Math.floor(Math.random() * 100) + 1;
	await Database.truncate(['category'], initialCategoryId);

	user = await User.create(
		faker.internet.userName(),
		faker.internet.email(),
		faker.internet.password(),
	);
});

test('Category was created successfully.', async () => {
	const title = faker.lorem.word();
	const description = faker.lorem.sentence();
	const category = await Category.create(user.getId(), title, description);

	expect(category).toBeInstanceOf(Category);
	expect(category.getId()).toBe(initialCategoryId);
	expect(category.getTitle()).toBe(title);
	expect(category.getDescription()).toBe(description);
	expect(category.getUser()).toBeInstanceOf(User);
	expect(category.getUser().getId()).toBe(user.getId());
});

test('Category was not created with non-existant user.', async () => {
	const category = await Category.create(
		user.getId() + 1,
		faker.lorem.word(),
		faker.lorem.sentence(),
	);

	expect(category).toBeNull();
});

test('Category was not created with blank title.', async () => {
	const category = await Category.create(
		user.getId(),
		'',
		faker.lorem.sentence(),
	);

	expect(category).toBeNull();
});

test('Category was not created with duplicate title.', async () => {
	const title = faker.lorem.word();

	await Category.create(
		user.getId(),
		title,
		faker.lorem.sentence(),
	);

	const category = await Category.create(
		user.getId(),
		title,
		faker.lorem.sentence(),
	);

	expect(category).toBeNull();
});

test('Category was found by ID.', async () => {
	const newCategory = await Category.create(
		user.getId(),
		faker.lorem.word(),
		faker.lorem.sentence(),
	);
	const retrievedCategory = await Category.findById(newCategory.getId());

	expect(retrievedCategory.getTitle()).toMatch(newCategory.getTitle());
	expect(retrievedCategory.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedCategory.getEditedAt()).toBeNull();
	expect(retrievedCategory.getDeletedAt()).toBeNull();
});

test('Category was not found by wrong ID.', async () => {
	const newCategory = await Category.create(
		user.getId(),
		faker.lorem.word(),
		faker.lorem.sentence(),
	);
	const retrievedCategory = await Category.findById(newCategory.getId() + 1);

	expect(retrievedCategory).toBeNull();
});

test('Category was found by title.', async () => {
	const newCategory = await Category.create(
		user.getId(),
		faker.lorem.word(),
		faker.lorem.sentence(),
	);
	const retrievedCategory = await Category.findByTitle(newCategory.getTitle());

	expect(retrievedCategory.getTitle()).toMatch(newCategory.getTitle());
});

test('Category was not found by wrong title.', async () => {
	const newCategory = await Category.create(
		user.getId(),
		faker.lorem.word(),
		faker.lorem.sentence(),
	);
	const retrievedCategory = await Category.findByTitle(`${newCategory.getTitle()}.wrong`);

	expect(retrievedCategory).toBeNull();
});

test('Category was updated successfully.', async () => {
	const title = faker.lorem.word();
	const category = await Category.create(
		user.getId(),
		title,
		faker.lorem.sentence(),
	);
	const newCategoryTitle = faker.lorem.word();

	category.setTitle(newCategoryTitle);
	expect(category.getEditedAt()).toBeNull();

	const wasUpdated = await category.save();

	expect(wasUpdated).toBe(true);

	const retrievedCategory = await Category.findById(category.getId());

	expect(retrievedCategory.getTitle()).toMatch(newCategoryTitle);
	expect(retrievedCategory.getTitle()).not.toMatch(title);
	expect(retrievedCategory.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedCategory.getEditedAt()).toBeInstanceOf(Date);
	expect(retrievedCategory.getDeletedAt()).toBeNull();
});

test('Category was not updated with blank title.', async () => {
	const category = await Category.create(
		user.getId(),
		faker.lorem.word(),
		faker.lorem.sentence(),
	);

	category.setTitle('');

	const wasUpdated = await category.save();

	expect(wasUpdated).toBe(false);
});

test('Category was deleted successfully.', async () => {
	const category = await Category.create(
		user.getId(),
		faker.lorem.word(),
		faker.lorem.sentence(),
	);

	expect(category.getDeletedAt()).toBeNull();

	const wasDeleted = await category.delete();

	expect(wasDeleted).toBe(true);

	const retrievedCategory = await Category.findById(category.getId());

	expect(retrievedCategory.getCreatedAt()).toBeInstanceOf(Date);
	expect(retrievedCategory.getEditedAt()).toBeNull();
	expect(retrievedCategory.getDeletedAt()).toBeInstanceOf(Date);
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

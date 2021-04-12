const { chromium } = require('playwright-chromium');
const Url = require('../src/helpers/Url');
const Pokemon = require('../src/models/Pokemon');
const {
	generatePokemonData,
	truncateDatabase,
	generatePokemon,
	generateRandomId,
} = require('./TestHelper');

let browser;
let context;
let page;

beforeAll(async () => {
	browser = await chromium.launch({
		headless: false,
		// slowMo: 1000, // Uncomment this if you want to make the tests slower.
		size: { width: 1280, height: 720 },
	});

	context = await browser.newContext();
});

afterAll(async () => {
	await context.close();
	await browser.close();
});

beforeEach(async () => {
	page = await context.newPage();
});

afterEach(async () => {
	await page.close();
	await truncateDatabase();
});

test('Homepage was retrieved successfully.', async () => {
	await page.goto(Url.base());

	expect(await page.title()).toBe('Welcome');

	const h1 = await page.$('h1');
	const homeNavLink = await page.$(`nav a[href="${Url.base()}"]`);
	const listPokemonLink = await page.$(`nav a[href="${Url.path('pokemon')}"]`);
	const newPokemonLink = await page.$(`nav a[href="${Url.path('pokemon/new')}"]`);
	const footer = await page.$('footer');

	expect(h1).not.toBeNull();
	expect(homeNavLink).not.toBeNull();
	expect(listPokemonLink).not.toBeNull();
	expect(newPokemonLink).not.toBeNull();
	expect(footer).not.toBeNull();

	expect(await h1.innerText()).toBe('Homepage!');
	expect(await homeNavLink.innerText()).toBe('Home');
	expect(await listPokemonLink.innerText()).toBe('List All Pokemon');
	expect(await newPokemonLink.innerText()).toBe('Create Pokemon');
	expect(await footer.innerText()).toBe('© Copyright 2021 Vikram Singh');
});

test('Invalid path returned error.', async () => {
	await page.goto(Url.path('digimon'));
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch('Invalid request path!');
});

test('Pokemon created successfully.', async () => {
	const pokemonData = generatePokemonData();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('pokemon/new')}"]`);

	const h1 = await page.$('h1');

	expect(await h1.innerText()).toMatch('Create New Pokemon');

	await page.fill('form#new-pokemon-form input[name="name"]', pokemonData.name);
	await page.fill('form#new-pokemon-form input[name="type"]', pokemonData.type);
	await page.click('form#new-pokemon-form button');

	const pokemon = await Pokemon.findByName(pokemonData.name);

	expect(await page.title()).toBe(pokemon.getName());
	expect(await page.url()).toBe(Url.path(`pokemon/${pokemon.getId()}`));

	await page.waitForSelector('#name');

	const nameElement = await page.$('#name');
	const typeElement = await page.$('#type');

	expect(await nameElement.innerText()).toBe(pokemonData.name);
	expect(await typeElement.innerText()).toBe(pokemonData.type);
});

test.each`
	name           | type       | message              | pokemonExists
	${''}          | ${'Grass'} | ${'Missing name.'}   | ${false}
	${'Bulbasaur'} | ${''}      | ${'Missing type.'}   | ${false}
	${'Bulbasaur'} | ${'Grass'} | ${'Duplicate name.'} | ${true}
`('Pokemon not created with $message.', async ({
	name, type, message, pokemonExists,
}) => {
	if (pokemonExists) {
		await generatePokemon('Bulbasaur', 'Grass');
	}

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('pokemon/new')}"]`);

	let h1 = await page.$('h1');

	expect(await h1.innerText()).toMatch('Create New Pokemon');

	await page.fill('form#new-pokemon-form input[name="name"]', name);
	await page.fill('form#new-pokemon-form input[name="type"]', type);
	await page.click('form#new-pokemon-form button');
	await page.waitForSelector('h1');

	h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot create Pokemon: ${message}`);
});

test('Pokemon found by ID.', async () => {
	const pokemon = await generatePokemon();

	await page.goto(Url.path('pokemon/{id}', pokemon.getId()));
	await page.waitForSelector('#name');

	const nameElement = await page.$('#name');
	const typeElement = await page.$('#type');

	expect(await nameElement.innerText()).toBe(pokemon.getName());
	expect(await typeElement.innerText()).toBe(pokemon.getType());
});

test('Pokemon not found by wrong ID.', async () => {
	const randomPokemonId = generateRandomId();

	await page.goto(Url.path('pokemon/{id}', randomPokemonId));
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch(`Cannot retrieve Pokemon: Pokemon does not exist with ID ${randomPokemonId}.`);
});

test('Pokemon found by ID.', async () => {
	const pokemon = await generatePokemon();

	await page.goto(Url.path('pokemon/{id}', pokemon.getId()));
	await page.waitForSelector('#name');

	const nameElement = await page.$('#name');
	const typeElement = await page.$('#type');

	expect(await nameElement.innerText()).toBe(pokemon.getName());
	expect(await typeElement.innerText()).toBe(pokemon.getType());
});

test('All Pokemon were found.', async () => {
	const pokemonList = [
		await generatePokemon(),
		await generatePokemon(),
		await generatePokemon(),
	];

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('pokemon')}"]`);
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const tableRows = await page.$$('tbody > tr');

	expect(await h1.innerText()).toMatch('All Pokemon');
	expect(tableRows.length).toBe(pokemonList.length);

	for (let i = 0; i < tableRows.length; i++) {
		expect(await tableRows[i].innerText()).toMatch(pokemonList[i].name);
		expect(await tableRows[i].innerText()).toMatch(pokemonList[i].type);
	}
});

test('No Pokemon were found.', async () => {
	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('pokemon')}"]`);
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('All Pokemon');
	expect(await body.innerText()).toMatch('No Pokemon in the database! Please add one first.');
});

test('Pokemon updated successfully.', async () => {
	let pokemon = await generatePokemon();
	const newPokemonData = generatePokemonData();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('pokemon')}"]`);
	await page.click(`a[href="${Url.path('pokemon/{id}/edit', pokemon.getId())}"]`);
	await page.waitForSelector('form#edit-pokemon-form');
	await page.fill('form#edit-pokemon-form input[name="name"]', newPokemonData.name);
	await page.fill('form#edit-pokemon-form input[name="type"]', newPokemonData.type);
	await page.click('form#edit-pokemon-form button');

	pokemon = await Pokemon.findByName(newPokemonData.name);

	expect(await page.title()).toBe(pokemon.getName());
	expect(await page.url()).toBe(Url.path(`pokemon/${pokemon.getId()}`));

	await page.waitForSelector('#name');

	const nameElement = await page.$('#name');
	const typeElement = await page.$('#type');

	expect(await nameElement.innerText()).toBe(newPokemonData.name);
	expect(await typeElement.innerText()).toBe(newPokemonData.type);
});

test('Pokemon not updated with empty form.', async () => {
	const pokemon = await generatePokemon();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('pokemon')}"]`);
	await page.click(`a[href="${Url.path('pokemon/{id}/edit', pokemon.getId())}"]`);
	await page.waitForSelector('form#edit-pokemon-form');
	await page.click('form#edit-pokemon-form button');
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('Error');
	expect(await body.innerText()).toMatch('Cannot update Pokemon: No update parameters were provided.');
});

test('Pokemon deleted successfully.', async () => {
	const pokemon = await generatePokemon();

	await page.goto(Url.base());
	await page.click(`a[href="${Url.path('pokemon')}"]`);
	await page.click(`table tr[pokemon-id="${pokemon.getId()}"] .delete-button`);
	await page.waitForSelector('h1');

	const h1 = await page.$('h1');
	const body = await page.$('body');

	expect(await h1.innerText()).toMatch('All Pokemon');
	expect(await body.innerText()).toMatch('No Pokemon in the database! Please add one first.');
});

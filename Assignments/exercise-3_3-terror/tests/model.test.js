const Pokemon = require('../src/models/Pokemon');
const logger = require('../src/helpers/Logger');
const {
	generatePokemonData,
	generatePokemon,
	truncateDatabase,
} = require('./TestHelper');

logger.toggleConsoleLog(false);

test('Pokemon was created successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);

	expect(pokemon).toBeInstanceOf(Pokemon);
	expect(pokemon.getId()).toBe(1);
	expect(pokemon.getName()).toBe(name);
	expect(pokemon.getType()).toBe(type);
});

test('Exception was thrown when creating Pokemon with blank name.', async () => {
	const { type } = generatePokemonData();

	await expect(Pokemon.create('', type)).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot create Pokemon: Missing name.',
	});
});

test('Exception was thrown when creating Pokemon with blank type.', async () => {
	const { name } = generatePokemonData();

	await expect(Pokemon.create(name, '')).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot create Pokemon: Missing type.',
	});
});

test('Exception was thrown when creating Pokemon with duplicate name.', async () => {
	const { name, type } = generatePokemonData();
	await Pokemon.create(name, type);

	await expect(Pokemon.create(name, type)).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot create Pokemon: Duplicate name.',
	});
});

test('Pokemon was found by ID.', async () => {
	const newPokemon = await generatePokemon();
	const retrievedPokemon = await Pokemon.findById(newPokemon.getId());

	expect(retrievedPokemon.getName()).toMatch(newPokemon.getName());
});

test('Pokemon was updated successfully.', async () => {
	const newPokemon = await generatePokemon();
	const newPokemonName = generatePokemonData().name;

	newPokemon.setName(newPokemonName);

	const wasUpdated = await newPokemon.save();

	expect(wasUpdated).toBe(true);

	const retrievedPokemon = await Pokemon.findById(newPokemon.getId());

	expect(newPokemonName).toMatch(retrievedPokemon.getName());
});

test('Exception was thrown when updating Pokemon with blank name.', async () => {
	const pokemon = await generatePokemon();

	pokemon.setName('');

	await expect(pokemon.save()).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot update Pokemon: Missing name.',
	});
});

test('Exception was thrown when updating Pokemon with blank type.', async () => {
	const pokemon = await generatePokemon();

	pokemon.setType('');

	await expect(pokemon.save()).rejects.toMatchObject({
		name: 'PokemonException',
		message: 'Cannot update Pokemon: Missing type.',
	});
});

test('Pokemon was deleted successfully.', async () => {
	const pokemon = await generatePokemon();
	const wasDeleted = await pokemon.remove();

	expect(wasDeleted).toBe(true);

	const retrievedPokemon = await Pokemon.findById(pokemon.getId());

	expect(retrievedPokemon).toBeNull();
});

afterEach(async () => {
	await truncateDatabase();
});

const Pokemon = require('../src/models/Pokemon');
const Database = require('../src/database/Database');

const pokemonData = [
	{ name: 'Bulbasaur', type: 'Grass' },
	{ name: 'Charmander', type: 'Fire' },
	{ name: 'Squirtle', type: 'Water' },
	{ name: 'Pikachu', type: 'Lightning' },
	{ name: 'Pidgeotto', type: 'Flying' },
	{ name: 'Koffing', type: 'Poison' },
	{ name: 'Dragonite', type: 'Dragon' },
	{ name: 'Machamp', type: 'Fighting' },
	{ name: 'Clefairy', type: 'Fairy' },
	{ name: 'Eevee', type: 'Normal' },
	{ name: 'Sandslash', type: 'Ground' },
	{ name: 'Vulpix', type: 'Fire' },
	{ name: 'Alakazam', type: 'Psychic' },
	{ name: 'Onyx', type: 'Rock' },
	{ name: 'Hitmonlee', type: 'Fighting' },
	{ name: 'Snorlax', type: 'Normal' },
];

/** Since a Pokemon can only be added to the DB once, we have to splice from the array. */
const generatePokemonData = () => pokemonData.splice(Math.floor((Math.random() * pokemonData.length)), 1)[0];

test('Pokemon was created successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);

	expect(pokemon).toBeInstanceOf(Pokemon);
	expect(pokemon.getId()).toBe(1);
	expect(pokemon.getName()).toBe(name);
	expect(pokemon.getType()).toBe(type);
});

test('Pokemon was found by ID.', async () => {
	const { name, type } = generatePokemonData();
	const newPokemon = await Pokemon.create(name, type);
	const retrievedPokemon = await Pokemon.findById(newPokemon.getId());

	expect(retrievedPokemon.getName()).toMatch(newPokemon.getName());
});

test('Pokemon was updated successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);
	const newPokemonName = generatePokemonData().name;

	pokemon.setName(newPokemonName);

	const wasUpdated = await pokemon.save();

	expect(wasUpdated).toBe(true);

	const retrievedPokemon = await Pokemon.findById(pokemon.getId());

	expect(newPokemonName).toMatch(retrievedPokemon.getName());
});

test('Pokemon was deleted successfully.', async () => {
	const { name, type } = generatePokemonData();
	const pokemon = await Pokemon.create(name, type);

	const wasDeleted = await pokemon.delete();

	expect(wasDeleted).toBe(true);

	const retrievedPokemon = await Pokemon.findById(pokemon.getId());

	expect(retrievedPokemon).toBeNull();
});

afterEach(async () => {
	const connection = await Database.connect();
	const tables = ['pokemon'];

	try {
		await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

		tables.forEach(async (table) => {
			await connection.execute(`DELETE FROM ${table}`);
			await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
		});

		await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
	}
	catch (exception) {
		console.log(exception.sqlMessage);
	}
	finally {
		await connection.end();
	}
});

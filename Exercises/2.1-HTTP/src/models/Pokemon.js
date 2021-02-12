const Model = require('./Model');

class Pokemon extends Model {
	/**
	 * @param {number} id
	 * @param {string} name
	 * @param {string} type
	 */
	constructor(id, name, type) {
		super(id);
		this.name = name;
		this.type = type;
	}

	/**
	 * Creates a new Pokemon in the database and returns a Pokemon object.
	 * @param {string} name The Pokemon's name (ex. Bulbasaur).
	 * @param {string} type The Pokemon's type (ex. Grass).
	 * @returns {Pokemon} The created Pokemon.
	 */
	static async create(name, type) {
		const connection = await Model.connect();
		const result = await connection.insert('pokemon', { name, type });

		return new Pokemon(result.id, result.name, result.type);
	}

	/**
	 * Finds the Pokemon by their ID and returns a Pokemon object.
	 * @param {number} id The Pokemon's ID.
	 * @returns {Pokemon} The Pokemon object.
	 */
	static async findById(id) {
		const connection = await Model.connect();
		const result = connection.select('pokemon', { id });

		return new Pokemon(result[0].id, result[0].name, result[0].type);
	}

	/**
	 * Finds all Pokemon in the database.
	 * @returns {Array} All Pokemon.
	 */
	static async findAll() {
		const connection = await Model.connect();

		return connection.select('pokemon');
	}

	/**
	 * Persists the current state of this Pokemon object to the database.
	 * @returns {boolean} If the operation was successful.
	 */
	async save() {
		const connection = await Model.connect();
		const result = connection.update('pokemon', {
			id: this.id,
			name: this.name,
			type: this.type,
		});

		return result;
	}

	/**
	 * Deletes the Pokemon with this ID from the database.
	 * @returns {boolean} If the operation was successful.
	 */
	async delete() {
		const connection = await Model.connect();
		const result = connection.delete('pokemon', this.id);

		return result;
	}

	getName() {
		return this.name;
	}

	getType() {
		return this.type;
	}

	setName(name) {
		this.name = name;
	}

	setType(type) {
		this.type = type;
	}

	jsonSerialize() {
		return {
			id: this.id,
			name: this.name,
			type: this.type
		};
	}
}

module.exports = Pokemon;

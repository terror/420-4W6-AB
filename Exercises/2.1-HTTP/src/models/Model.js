const Database = require('../database/Database');

/**
 * A generic class that should be extended by concrete models (i.e. Pokemon).
 */
class Model {
	/**
	 * Creates a new Model whose ID should be one that is passed up from a concrete model.
	 * @param {number} id
	 */
	constructor(id) {
		this.id = id;
	}

	/**
	 * Provides a handle to the Database object.
	 * @returns {Database} The object you can use to invoke database methods.
	 */
	static async connect() {
		const database = new Database();

		await database.initializeDatabase();

		return database;
	}

	getId() {
		return this.id;
	}

	setId(id) {
		this.id = id;
	}
}

module.exports = Model;

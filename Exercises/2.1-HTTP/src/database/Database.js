const fs = require('fs').promises;

/**
 * This class is meant to mimic a relational database schema where users can
 * select/insert/update/delete data into JSON files that act as the database tables.
 */
class Database {
	constructor() {
		/**
		 * An object where each property represents one database table.
		 *
		 * Here is an example of the object's internal structure:
		 * ```javascript
		 * tables = {
		 *     pokemon: {
		 *         columns: {
		 *             id: 'int',
		 *             name: 'string',
		 *             type: 'string',
		 *         },
		 *         rows: [
		 *             {id: 1, name: 'Bulbasaur', type: 'Grass'},
		 *             {id: 2, name: 'Charmander', type: 'Fire'},
		 *             {id: 3, name: 'Squirtle', type: 'Water'},
		 *         ]
		 *     },
		 * };
		 * ```
		 * @type {Object}
		 */
		this.tables = {};
	}

	/**
	 * Looks inside of the "tables" folder for any .json table definitions
	 * and populates this.tables with the definitions found.
	 */
	async initializeDatabase() {
		let files = [];

		try {
			files = await fs.readdir(`${__dirname}/tables/`);
		}
		catch (error) {
			console.log(error);
		}

		/**
		 * Passing an async callback to map will return an array of
		 * pending promises that we can resolve with Promise.all().
		 */
		await Promise.all(files.map(async (file) => {
			const tableName = file.match(/(.+)\.json/);
			await this.readFromTable(tableName[1]);
		}));
	}

	/**
	 * Reads the contents of a .json table definition file.
	 * @param {string} tableName
	 */
	async readFromTable(tableName) {
		const filename = `${__dirname}/tables/${tableName}.json`;

		try {
			this.tables[tableName] = JSON.parse((await fs.readFile(filename)).toString());
		}
		catch (error) {
			console.log(error);
		}
	}

	/**
	 * Writes data to a .json table definition file.
	 * @param {string} tableName
	 */
	async writeToTable(tableName) {
		const filename = `${__dirname}/tables/${tableName}.json`;

		try {
			await fs.writeFile(filename, JSON.stringify(this.tables[tableName]));
		}
		catch (error) {
			console.log(error);
		}
	}

	/**
	 * Inserts a row into the database.
	 * @param {string} tableName
	 * @param {object} parameters
	 * @returns {object} The inserted data.
	 */
	async insert(tableName, parameters) {
		if (!this.doesTableExist(tableName)) {
			throw new Error(`Table ${tableName} does not exist in the database.`);
		}

		this.checkParameters(tableName, parameters);

		// Check if the parameter types match the column types.
		Object.entries(parameters).forEach((column) => {
			const [columnName, value] = column;
			const columnType = this.tables[tableName].columns[columnName];

			if (typeof (value) !== columnType) {
				throw new Error(`Invalid type for column '${columnName}'. Expected: ${columnType}. Actual: ${typeof value}.`);
			}
		});

		const result = parameters;
		result.id = this.getNextId(tableName);
		this.tables[tableName].rows.push(result);
		await this.writeToTable(tableName);

		return result;
	}

	/**
	 * Select a row from a specified table.
	 * @param {string} tableName
	 * @param {object} [parameters={}]
	 * @returns {array} All rows that match the criteria parameters.
	 */
	select(tableName, parameters = {}) {
		if (!this.doesTableExist(tableName)) {
			throw new Error(`Table ${tableName} does not exist in the database.`);
		}

		this.readFromTable(tableName);
		const tableRows = this.tables[tableName].rows;

		if (Object.keys(parameters).length === 0) {
			return tableRows;
		}

		// Check if the parameter types match the column types.
		Object.entries(parameters).forEach((column) => {
			const [columnName] = column;

			if (!this.tables[tableName].columns[columnName]) {
				throw new Error(`Column ${columnName} does not exist in table ${tableName}.`);
			}
		});

		const matchesNeeded = Object.keys(parameters).length;
		const results = [];

		tableRows.forEach((row) => {
			let matches = 0;

			Object.entries(parameters).forEach((column) => {
				const [columnName, value] = column;

				if (row[columnName] === value) {
					matches++;
				}

				if (matches === matchesNeeded) {
					results.push(row);
				}
			});
		});

		return results;
	}

	/**
	 * Updates a row in the specified table.
	 * @param {string} tableName
	 * @param {object} parameters An object containing the data you want to update. Must include the ID.
	 * @returns {boolean} If the operation was successful or not.
	 */
	async update(tableName, parameters) {
		if (!this.doesTableExist(tableName)) {
			throw new Error(`Table ${tableName} does not exist in the database.`);
		}

		this.checkParameters(tableName, parameters, true);

		const tableRows = this.tables[tableName].rows;
		let rowWasUpdated = false;

		await Promise.all(tableRows.map(async (row, index) => {
			if (row.id === parameters.id) {
				this.tables[tableName].rows[index] = parameters;
				await this.writeToTable(tableName);
				rowWasUpdated = true;
			}
		}));

		return rowWasUpdated;
	}

	/**
	 * Deletes a row in the specified table.
	 * @param {string} tableName
	 * @param {number} id An object containing the data you want to update. Must include the ID.
	 * @returns {boolean} If the operation was successful or not.
	 */
	async delete(tableName, id) {
		if (!this.doesTableExist(tableName)) {
			throw new Error(`Table ${tableName} does not exist in the database.`);
		}

		const tableRows = this.tables[tableName].rows;
		let rowWasDeleted = false;

		await Promise.all(tableRows.map(async (row, index) => {
			if (row.id === id) {
				this.tables[tableName].rows.splice(index, 1);
				await this.writeToTable(tableName);
				rowWasDeleted = true;
			}
		}));

		return rowWasDeleted;
	}

	/**
	 * Checks if this.tables has the specified table.
	 * @param {string} tableName
	 */
	doesTableExist(tableName) {
		return this.tables.hasOwnProperty(tableName);
	}

	/**
	 * Generates the next available ID for the specified table.
	 * @param {*} tableName
	 */
	getNextId(tableName) {
		const rowCount = this.tables[tableName].rows.length;
		return rowCount === 0 ? 1 : this.tables[tableName].rows[rowCount - 1].id + 1;
	}

	/**
	 * Check if the number of parameters given matches the
	 * number of columns of the table (minus the ID column).
	 * @param {string} tableName
	 * @param {object} parameters
	 * @param {boolean} [includeIdColumn=false]
	 */
	checkParameters(tableName, parameters, includeIdColumn) {
		let validColumnNumber = Object.keys(this.tables[tableName].columns).length;

		if (!includeIdColumn) {
			validColumnNumber--;
		}

		if (Object.keys(parameters).length !== validColumnNumber) {
			throw new Error(`Invalid number of parameters given. Expecting: ${Object.keys(this.tables[tableName].columns).length - 1}. Actual: ${Object.keys(parameters).length}.`);
		}
	}

	/**
	 * Deletes all rows from the specified table.
	 * @param {string} tableName
	 */
	async truncate(tableName) {
		this.tables[tableName].rows = [];
		await this.writeToTable(tableName);
	}
}

module.exports = Database;

const mysql = require('mysql2/promise');
require('dotenv').config({ path: `${__dirname}/.env` });

class Database {
	static async connect() {
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			multipleStatements: true,
		});

		return connection;
	}
}

module.exports = Database;

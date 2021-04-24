const Model = require('./Model');
const PokemonException = require('../exceptions/PokemonException');
const DatabaseException = require('../exceptions/DatabaseException');

class Pokemon extends Model {
  /**
   * Creates a new Pokemon.
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
    if (!name)
      throw new PokemonException('Cannot create Pokemon: Missing name.');
    if (!type)
      throw new PokemonException('Cannot create Pokemon: Missing type.');

    const connection = await Model.connect();
    const sql = `INSERT INTO pokemon (name, type) VALUES (?, ?)`;
    let results;

    try {
      [results] = await connection.execute(sql, [name, type]);
    } catch (exception) {
      throw new PokemonException('Cannot create Pokemon: Duplicate name.');
    } finally {
      await connection.end();
    }
    if (!results) return null;

    const { insertId } = results;
    return new Pokemon(insertId, name, type);
  }

  /**
   * Finds the Pokemon by their ID and returns a Pokemon object.
   * @param {number} id The Pokemon's ID.
   * @returns {Pokemon} The Pokemon object.
   */
  static async findById(id) {
    const connection = await Model.connect();
    const sql = `SELECT * FROM \`pokemon\` WHERE \`id\` = ?`;
    let results;

    if (!id) throw new PokemonException('Cannot retrieve Pokemon, Missing ID.');

    try {
      [results] = await connection.execute(sql, [id]);
    } catch (exception) {
      throw new DatabaseException(exception);
    } finally {
      await connection.end();
    }

    if (!results.length) return null;

    const { name, type } = results[0];
    return new Pokemon(parseInt(id), name, type);
  }

  /**
   * Finds the Pokemon by their name and returns a Pokemon object.
   * @param {string} name The Pokemon's name.
   * @returns {Pokemon} The Pokemon object.
   */
  static async findByName(name) {
    const connection = await Model.connect();
    const sql = `SELECT * FROM \`pokemon\` WHERE \`name\` = ?`;
    let results;

    try {
      [results] = await connection.execute(sql, [name]);
    } catch (err) {
      console.log(err);
    } finally {
      await connection.end();
    }

    if (!results.length) return null;

    const { id, type } = results[0];
    return new Pokemon(id, name, type);
  }

  static async findAll() {
    const connection = await Model.connect();
    const sql = 'SELECT * FROM pokemon';
    let results;

    try {
      [results] = await connection.execute(sql);
    } catch (exception) {
      throw new DatabaseException(exception);
    } finally {
      await connection.end();
    }

    if (!results.length) return [];

    let ret = [];
    for (let i = 0; i < results.length; ++i) {
      const { id, name, type } = results[i];
      ret.push(new Pokemon(id, name, type));
    }
    return ret;
  }

  /**
   * Persists the current state of this Pokemon object to the database.
   * @returns {boolean} If the operation was successful.
   */
  async save() {
    if (!this.name)
      throw new PokemonException('Cannot update Pokemon: Missing name.');
    if (!this.type)
      throw new PokemonException('Cannot update Pokemon: Missing type.');

    const connection = await Model.connect();
    const sql = 'UPDATE pokemon SET name = ?, type = ? where id = ?';

    try {
      await connection.execute(sql, [this.name, this.type, this.id]);
    } catch (exception) {
      throw new DatabaseException(exception);
    } finally {
      await connection.end();
    }
    return true;
  }

  /**
   * Deletes the Pokemon with this ID from the database.
   * @returns {boolean} If the operation was successful.
   */
  async remove() {
    const connection = await Model.connect();
    const sql = `DELETE FROM pokemon WHERE id = ?`;
    try {
      await connection.execute(sql, [this.id]);
    } catch (exception) {
      throw new DatabaseException(exception);
    } finally {
      await connection.end();
    }
    return true;
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
}

module.exports = Pokemon;

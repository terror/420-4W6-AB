const Database = require('../database/Database');

/**
 * All concrete models will inherit from this base class.
 */
class Model {
  constructor(id) {
    this.id = id;
  }

  static connect() {
    return Database.connect();
  }

  getId() {
    return this.id;
  }
}

module.exports = Model;

const Database = require('../database/Database');

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

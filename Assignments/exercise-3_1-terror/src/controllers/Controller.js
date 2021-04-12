const PokemonException = require('../exceptions/PokemonException');

class Controller {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }

  getAction() {
    return this.action;
  }

  setAction(a) {
    this.action = a;
  }

  async doAction() {
    let ret;
    try {
      ret = this.action();
    } catch (e) {
      throw e;
    }
    return ret;
  }

  async error() {
    return this.response;
  }
}

module.exports = Controller;

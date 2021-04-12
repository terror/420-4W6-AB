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
    return await this.response.setResponse({
      template: 'ErrorView',
      title: 'Error',
      statusCode: 200,
      payload: { msg: 'Invalid request path!'},
    })
  }
}

module.exports = Controller;

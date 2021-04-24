const Pokemon = require('../models/Pokemon');
const ErrorController = require('../controllers/ErrorController');
const HomeController = require('../controllers/HomeController');
const PokemonController = require('../controllers/PokemonController');
const AuthController = require('../controllers/AuthController');

/**
 * This class is responsible for invoking the appropriate method
 * on the appropriate model based on the results of the parsed `Request`.
 * Once the `message` and `payload` have been determined, it will return
 * a `Response` object to be sent back to the client as an HTTP response.
 */
class Router {
  constructor(request, response, session) {
    this.request = request;
    this.response = response;
    this.session = session;
    this.setController(this.request.controllerName);
  }

  setController(c) {
    switch (c) {
      case '':
        this.controller = new HomeController(
          this.request,
          this.response,
          this.session
        );
        break;
      case 'pokemon':
        this.controller = new PokemonController(
          this.request,
          this.response,
          this.session
        );
        break;
      case 'auth':
        this.controller = new AuthController(
          this.request,
          this.response,
          this.session
        );
        break;
      default:
        this.controller = new ErrorController(
          this.request,
          this.response,
          this.session
        );
        break;
    }
  }

  getController() {
    return this.controller;
  }

  async dispatch() {
    let ret;
    try {
      ret = await this.controller.doAction();
    } catch (e) {
      this.response.setResponse({
        statusCode: e.statusCode,
        message: e.message,
        payload: {},
      });
      return this.response;
    }
    return ret;
  }
}

module.exports = Router;

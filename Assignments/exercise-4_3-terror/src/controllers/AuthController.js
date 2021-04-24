const Controller = require('./Controller');
const AuthExceptionk = require('../exceptions/AuthException');
const HttpStatusCode = require('../helpers/HttpStatusCode');
const Pokemon = require('../models/Pokemon');
const Logger = require('../helpers/Logger');

class AuthController extends Controller {
  constructor(request, response, session) {
    super(request, response, session);
    const params = this.request.parameters.header;

    switch (request.getRequestMethod()) {
      case 'GET':
        if (params[0] === 'register') this.setAction(this.getRegisterForm);
        else if (params[0] === 'login') this.setAction(this.getLoginForm);
        else this.setAction(this.logout);
        break;
      case 'POST':
        this.setAction(this.login);
      default:
        break;
    }
  }

  async getRegisterForm() {
    return await this.response.setResponse({
      template: 'Pokemon/NewFormView',
      title: 'New Pokemon',
      payload: {},
    });
  }

  async getLoginForm() {
    return await this.response.setResponse({
      template: 'Auth/LoginFormView',
      title: 'Login',
      payload: {},
    });
  }

  async login() {
    const { name, type } = this.request.getParameters().body;
    const pokemon = await Pokemon.findByName(name);

    this.session.set(pokemon.getId(), name);

    return this.response.setResponse({
      template: 'Pokemon/ShowView',
      statusCode: 200,
      payload: pokemon,
      message: 'Logged in successfully!',
    });
  }

  logout() {
    this.session.destroy();
    return this.response.setResponse({
      redirect: '/',
      message: 'Logged out successfully!',
    });
  }
}

module.exports = AuthController;

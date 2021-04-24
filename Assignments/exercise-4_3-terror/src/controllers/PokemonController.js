const Controller = require('./Controller');
const Pokemon = require('../models/Pokemon');
const PokemonException = require('../exceptions/PokemonException');
const HttpStatusCode = require('../helpers/HttpStatusCode');
const Logger = require('../helpers/Logger');

class PokemonController extends Controller {
  constructor(request, response, session) {
    super(request, response, session);

    switch (request.getRequestMethod()) {
      case 'GET':
        let values = this.request.parameters.header;
        if (values.length) {
          if (values.length == 2) this.setAction(this.getEditForm);
          else if (values[0] === 'new') this.setAction(this.getNewForm);
          else this.setAction(this.show);
          break;
        }
        this.setAction(this.list);
        break;
      case 'POST':
        this.setAction(this.new);
        break;
      case 'PUT':
        this.setAction(this.edit);
        break;
      case 'DELETE':
        this.setAction(this.destroy);
        break;
      default:
        this.setAction(this.error);
        this.response.setResponse({
          template: 'ErrorView',
          statusCode: HttpStatusCode.METHOD_NOT_ALLOWED,
          message: 'Invalid request method!',
        });
    }
  }

  async getNewForm() {
    return this.response.setResponse({
      template: 'Pokemon/NewFormView',
      title: 'New Pokemon',
    });
  }

  async getEditForm() {
    const id = this.request.getParameters().header[0];
    const user = await Pokemon.findById(id);

    if (!user) {
      throw new PokemonException(
        `Cannot retrieve Pokemon: Pokemon does not exist with ID ${id}.`
      );
    }

    return this.response.setResponse({
      template: 'Pokemon/EditFormView',
      title: 'Edit Pokemon',
      payload: user,
    });
  }

  async new() {
    const { name, type } = this.request.getParameters().body;
    let res;

    try {
      res = await Pokemon.create(name, type);
    } catch (e) {
      return this.response.setResponse({
        template: 'ErrorView',
        statusCode: HttpStatusCode.BAD_REQUEST,
        payload: {},
        message: e.message,
      });
    }

    return this.response.setResponse({
      redirect: `pokemon/${res.getId()}`,
      message: 'Pokemon created successfully!',
      payload: res,
    });
  }

  async list() {
    const pokemon = await Pokemon.findAll();

    // add logged in flag
    for (let i = 0; i < pokemon.length; ++i)
      pokemon[i].isLoggedIn = this.session.get(pokemon[i].getId());

    return this.response.setResponse({
      template: 'Pokemon/ListView',
      message: 'Pokemon retrieved successfully!',
      payload: pokemon,
    });
  }

  async show() {
    const id = this.request.getParameters().header[0];
    const pokemon = await Pokemon.findById(id);

    if (!pokemon) {
      return this.response.setResponse({
        template: 'ErrorView',
        statusCode: HttpStatusCode.BAD_REQUEST,
        payload: {},
        message: `Cannot retrieve Pokemon: Pokemon does not exist with ID ${id}.`,
      });
    }

    return this.response.setResponse({
      template: 'Pokemon/ShowView',
      title: pokemon.getName(),
      message: 'Pokemon retrieved successfully!',
      payload: pokemon,
    });
  }

  async edit() {
    const { name, type } = this.request.parameters.body;
    if (!name && !type) {
      return await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: HttpStatusCode.BAD_REQUEST,
        message: `Cannot update Pokemon: No update parameters were provided.`,
      });
    }

    if (!this.session.get(this.request.parameters.header[0])) {
      return this.response.setResponse({
        statusCode: 401,
        message: 'Cannot update Pokemon: You must be logged in.',
        payload: {},
      });
    }

    let res;

    try {
      res = await Pokemon.findById(parseInt(this.request.parameters.header[0]));
    } catch (e) {
      throw e;
    }

    if (res === null) {
      return await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: StatusCodes.OK,
        payload: {
          msg: `Cannot retrieve Pokemon: Pokemon does not exist with ID ${this.request.parameters.header[0]}.`,
        },
      });
    }

    if (name) res.setName(name);
    if (type) res.setType(type);

    try {
      await res.save();
    } catch (e) {
      throw e;
    }

    return await this.response.setResponse({
      redirect: `pokemon/${res.getId()}`,
      message: 'Pokemon updated successfully!',
      payload: res,
    });
  }

  async destroy() {
    const id = this.request.getParameters().header[0];
    const pokemon = await Pokemon.findById(id);

    if (!this.session.get(this.request.parameters.header[0])) {
      return this.response.setResponse({
        statusCode: 401,
        message: 'Cannot delete Pokemon: You must be logged in.',
        payload: {},
      });
    }

    if (!pokemon) {
      throw new PokemonException(
        `Cannot delete Pokemon: Pokemon does not exist with ID ${id}.`
      );
    }

    if (!(await pokemon.remove())) {
      throw new PokemonException('Cannot delete Pokemon.');
    }

    return this.response.setResponse({
      redirect: 'pokemon',
      message: 'Pokemon deleted successfully!',
      payload: pokemon,
    });
  }
}

module.exports = PokemonController;

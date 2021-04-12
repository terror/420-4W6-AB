const Controller = require('./Controller');
const Pokemon = require('../models/Pokemon');
const PokemonException = require('../exceptions/PokemonException');

const statusCodes = {
  SUCCESS: 200,
  NOT_FOUND: 404,
};

class PokemonController extends Controller {
  constructor(request, response) {
    super(request, response);

    switch (request.requestMethod) {
      case 'POST':
        this.setAction(this.new);
        break;
      case 'GET':
        if (this.request.parameters.header.length) this.setAction(this.show);
        else this.setAction(this.list);
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
          statusCode: 405,
          message: 'Invalid request method!',
          payload: {},
        });
        break;
    }
  }

  async new() {
    const { name, type } = this.request.parameters.body;
    let res;

    try {
      res = await Pokemon.create(name, type);
    } catch (e) {
      throw e;
    }
    this.response.setResponse({
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Pokemon created successfully!',
    });
    return this.response;
  }

  async list() {
    const res = await Pokemon.findAll();
    this.response.setResponse({
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Pokemon retrieved successfully!',
    });
    return this.response;
  }

  async show() {
    let res;

    try {
      res = await Pokemon.findById(parseInt(this.request.parameters.header[0]));
    } catch (e) {
      throw e;
    }

    if (res === null) {
      throw new PokemonException(
        `Cannot retrieve Pokemon: Pokemon does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    this.response.setResponse({
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Pokemon retrieved successfully!',
    });

    return this.response;
  }

  async edit() {
    const { name, type } = this.request.parameters.body;
    if (!name && !type) {
      throw new PokemonException(
        `Cannot update Pokemon: No update parameters were provided.`
      );
    }

    let res;

    try {
      res = await Pokemon.findById(parseInt(this.request.parameters.header[0]));
    } catch (e) {
      throw e;
    }

    if (res === null) {
      throw new PokemonException(
        `Cannot update Pokemon: Pokemon does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    if (name)
      res.setName(name);
    if (type)
      res.setType(type);

    try {
      await res.save();
    } catch (e) {
      throw e;
    }

    this.response.setResponse({
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Pokemon updated successfully!',
    });

    return this.response;
  }

  async destroy() {
    let res;

    try {
      res = await Pokemon.findById(parseInt(this.request.parameters.header[0]));
    } catch (e) {
      throw e;
    }

    if (res === null) {
      throw new PokemonException(
        `Cannot delete Pokemon: Pokemon does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    try {
      await res.remove();
    } catch (e) {
      throw e;
    }

    this.response.setResponse({
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Pokemon deleted successfully!',
    });

    return this.response;
  }
}

module.exports = PokemonController;

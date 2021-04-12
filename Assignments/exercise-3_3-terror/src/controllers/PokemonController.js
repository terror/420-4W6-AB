const Controller = require('./Controller');
const Pokemon = require('../models/Pokemon');
const PokemonException = require('../exceptions/PokemonException');
const Logger = require('../helpers/Logger');
const StatusCodes = require('../helpers/HttpStatusCode');

class PokemonController extends Controller {
  constructor(request, response) {
    super(request, response);

    switch (request.requestMethod) {
      case 'POST':
        this.setAction(this.new);
        break;
      case 'GET':
        let values = this.request.parameters.header; 
        if (values.length) {
          if (values.length == 2) this.setAction(this.getEditForm) 
          else if (values[0] === 'new') this.setAction(this.getNewForm);
          else this.setAction(this.show);
          break;
        }
        this.setAction(this.list);
        break;
      case 'PUT':
        this.setAction(this.edit);
        break;
      case 'DELETE':
        this.setAction(this.destroy);
        break;
      default:
        this.setAction(this.error);
        break;
    }
  }

  async new() {
    const { name, type } = this.request.parameters.body;
    let res;

    try {
      res = await Pokemon.create(name, type);
    } catch (e) {
      return await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: 400,
        payload: { msg: e.message},
      })
    }
    return await this.response.setResponse({
      redirect: `pokemon/${res.getId()}`,
      message: 'Pokemon created successfully!',
      payload: res
    });
  }

  async getNewForm() {
    return await this.response.setResponse({
      template: 'Pokemon/NewFormView',
      payload: {},
      statusCode: StatusCodes.OK,
    });
  }

  async list() {
    const res = await Pokemon.findAll();

    let list = res.map((item) => {
      return { id: item.getId(), name: item.getName(), type: item.getType() }
    })

    return await this.response.setResponse({
      template: 'Pokemon/ListView',
      payload: list,
      message: 'Pokemon retrieved successfully!',
      statusCode: StatusCodes.OK,
    });
  }

  async show() {
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
        statusCode: 400,
        payload: { msg: `Cannot retrieve Pokemon: Pokemon does not exist with ID ${this.request.parameters.header[0]}.` },
      })
    }

    return await this.response.setResponse({
      template: 'Pokemon/ShowView',
      title: `${res.getName()}`,
      payload: { name: res.getName(), type: res.getType() },
      statusCode: StatusCodes.OK,
    });
  }
  


  async edit() {
    const { name, type } = this.request.parameters.body;
    if (!name && !type) {
      return await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: 400,
        payload: { msg: `Cannot update Pokemon: No update parameters were provided.` },
      })
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
        payload: { msg: `Cannot retrieve Pokemon: Pokemon does not exist with ID ${this.request.parameters.header[0]}.` },
      })
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
      payload: res
    });
  }

  async getEditForm() {
    return await this.response.setResponse({
      template: 'Pokemon/EditFormView',
      statusCode: 400,
      payload: { id: this.request.parameters.header[0] },
    });
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

    return await this.response.setResponse({
      redirect: 'pokemon',
      message: 'Pokemon deleted successfully!',
      payload: res
    });
  }
}

module.exports = PokemonController;

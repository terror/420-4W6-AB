const Controller = require('./Controller');
const User = require('../models/User');
const UserException = require('../exceptions/UserException');
const HttpStatusCode = require('../helpers/HttpStatusCode');

const statusCodes = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  ERROR: 400,
};

class UserController extends Controller {
  constructor(request, response, session) {
    super(request, response, session);
    switch (request.requestMethod) {
      case 'POST':
        this.setAction(this.new);
        break;
      case 'GET':
        const values = this.request.parameters.header;
        if (values.length) {
          if (values[0] == 'new') this.setAction(this.getNewForm);
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
    const { username, email, password } = this.request.parameters.body;

    let res;

    try {
      res = await User.create(username, email, password);
    } catch (e) {
      await this.response.setResponse({
        template: 'ErrorView',
        statusCode: statusCodes.ERROR,
        payload: {},
        message: e.message,
      });
      throw e;
    }

    return await this.response.setResponse({
      redirect: `auth/login`,
      message: 'User created successfully!',
      payload: res,
    });
  }

  async getNewForm() {
    return await this.response.setResponse({
      template: 'User/NewFormView',
      payload: {},
      statusCode: 200,
    });
  }

  async list() {
    const res = await User.findAll();
    this.response.setResponse({
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Users retrieved successfully!',
    });
    return this.response;
  }

  async show() {
    const res = await this.findUser(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    if (res.statusCode === statusCodes.NOT_FOUND) {
      await this.response.setResponse({
        template: 'ErrorView',
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: `Cannot retrieve User: User does not exist with ID ${this.request.parameters.header[0]}.`,
      });
      throw new UserException(
        `Cannot retrieve User: User does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    if (res.payload.getDeletedAt()) {
      return await this.response.setResponse({
        template: 'ErrorView',
        statusCode: 200,
        payload: res.payload,
        message: `User was deleted on ${res.payload.getDeletedAt()}`,
      });
    }

    // check if authenticated
    res.payload.auth = res.payload.getId() === this.session.get('user_id');

    return await this.response.setResponse({
      template: 'User/ShowView',
      title: `${res.payload.getUsername()}`,
      payload: res.payload,
      message: 'User retrieved successfully!',
      statusCode: 200,
    });
  }

  async edit() {
    const user_id = this.session.get('user_id');
    if (!user_id) {
      await this.response.setResponse({
        statusCode: HttpStatusCode.UNAUTHORIZED,
        message: 'Cannot update User: You must be logged in.',
        payload: {},
      });
      throw new UserException(
        'Cannot update User: You must be logged in.',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    const { username, email, password } = this.request.parameters.body;
    if (!username && !email && !password) {
      await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: 400,
        payload: {},
        message: `Cannot update User: No update parameters were provided.`,
      });

      throw new UserException(
        'Cannot update User: No update parameters were provided.'
      );
    }

    const res = await this.findUser(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    // check if wrong user
    if (res.payload.getId() !== user_id) {
      throw new UserException(
        'Cannot update User: You cannot update a user other than yourself.',
        HttpStatusCode.FORBIDDEN
      );
    }

    if (res.statusCode === statusCodes.NOT_FOUND) {
      throw new UserException(
        `Cannot update User: User does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    if (username) res.payload.setUsername(username);
    if (email) res.payload.setEmail(email);
    if (password) res.payload.setPassword(password);

    try {
      const ok = await res.payload.save();
    } catch (e) {
      throw e;
    }

    return await this.response.setResponse({
      redirect: `user/${res.payload.getId()}`,
      message: 'User updated successfully!',
      payload: res.payload,
    });
  }

  async getEditForm() {
    return await this.response.setResponse({
      template: 'User/EditFormView',
      statusCode: 200,
      payload: { id: this.request.parameters.header[0] },
    });
  }

  async destroy() {
    const user_id = this.session.get('user_id');
    if (!user_id) {
      throw new UserException(
        'Cannot delete User: You must be logged in.',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    const res = await User.findById(
      parseInt(this.request.parameters.header[0])
    );

    if (res === null) {
      throw new UserException(
        `Cannot delete User: User does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    // check if wrong user
    if (res.getId() !== user_id) {
      throw new UserException(
        'Cannot delete User: You cannot delete a user other than yourself.',
        HttpStatusCode.FORBIDDEN
      );
    }

    await res.remove();

    this.session.destroy();

    return await this.response.setResponse({
      redirect: `user/${res.getId()}`,
      message: 'User deleted successfully!',
      payload: res,
    });
  }

  async findUser(id, params) {
    const res = await User.findById(parseInt(id));

    if (res === null) {
      return {
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: 'Could not retrieve User.',
      };
    }

    return {
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'User retrieved successfully!',
    };
  }
}

module.exports = UserController;

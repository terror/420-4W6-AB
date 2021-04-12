const Controller = require('./Controller');
const Category = require('../models/Category');
const CategoryException = require('../exceptions/CategoryException');
const Post = require('../models/Post');

const statusCodes = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  ERROR: 400,
};

class CategoryController extends Controller {
  constructor(request, response) {
    super(request, response);
    switch (request.requestMethod) {
      case 'POST':
        this.setAction(this.new);
        break;
      case 'GET':
        let values = this.request.parameters.header;
        if (values.length) {
          if (values.length == 2) this.setAction(this.getEditForm);
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
        this.response.setResponse({
          statusCode: 405,
          message: 'Invalid request method!',
          payload: {},
        });
        break;
    }
  }

  async new() {
    const { userId, title, description } = this.request.parameters.body;

    let res;

    try {
      res = await Category.create(userId, title, description);
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
      redirect: '/',
      message: 'Category created successfully!',
      payload: res,
    });
  }

  async list() {
    const res = await Category.findAll();
    this.response.setResponse({
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Categories retrieved successfully!',
    });
    return this.response;
  }

  async show() {
    const res = await this.findCategory(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    if (res.statusCode === statusCodes.NOT_FOUND) {
      await this.response.setResponse({
        template: 'ErrorView',
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: `Cannot retrieve Category: Category does not exist with ID ${this.request.parameters.header[0]}.`,
      });
      throw new CategoryException(
        `Cannot retrieve Category: Category does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    let posts = await Post.findByCategory(this.request.parameters.header[0]);

    if (posts != null) {
      posts = posts.map((item) => {
        return {
          id: item.getId(),
          title: item.getTitle(),
          userId: item.getUser().getUsername(),
          createdAt: item.getCreatedAt(),
          deletedAt: item.getDeletedAt(),
        };
      });
    } else posts = [];

    // hacky v2
    res.payload.posts = posts;

    return await this.response.setResponse({
      template: 'Category/ShowView',
      title: res.payload.getTitle(),
      payload: res.payload,
      message: 'Category retrieved successfully!',
      statusCode: 200,
    });
  }

  async edit() {
    const { title, description } = this.request.parameters.body;
    if (!title && !description) {
      await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: 400,
        payload: {},
        message: `Cannot update Category: No update parameters were provided.`,
      });

      throw new CategoryException(
        `Cannot update Category: No update parameters were provided.`
      );
    }

    const res = await this.findCategory(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    if (res.statusCode === statusCodes.NOT_FOUND) {
      throw new CategoryException(
        `Cannot update Category: Category does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    if (title) res.payload.setTitle(title);
    if (description) res.payload.setDescription(description);

    try {
      const ok = await res.payload.save();
    } catch (e) {
      throw e;
    }

    return await this.response.setResponse({
      redirect: `category/${res.payload.getId()}`,
      message: 'Category updated successfully!',
      payload: res.payload,
    });
  }

  async getEditForm() {
    return await this.response.setResponse({
      template: 'Category/EditView',
      statusCode: 200,
      payload: { id: this.request.parameters.header[0] },
    });
  }

  async destroy() {
    const res = await Category.findById(
      parseInt(this.request.parameters.header[0])
    );

    if (res === null)
      throw new CategoryException(
        `Cannot delete Category: Category does not exist with ID ${this.request.parameters.header[0]}.`
      );

    await res.remove();

    return await this.response.setResponse({
      redirect: '/',
      message: 'Category deleted successfully!',
      payload: res,
    });
  }

  async findCategory(id, params) {
    const res = await Category.findById(
      parseInt(this.request.parameters.header[0])
    );
    if (res === null) {
      return {
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: 'Could not retrieve Category.',
      };
    }
    return {
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Category retrieved successfully!',
    };
  }
}

module.exports = CategoryController;

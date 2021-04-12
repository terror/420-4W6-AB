const Controller = require('./Controller');
const Post = require('../models/Post');
const PostException = require('../exceptions/PostException');
const Comment = require('../models/Comment');

const statusCodes = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  ERROR: 400,
};

class PostController extends Controller {
  constructor(request, response) {
    super(request, response);
    switch (request.requestMethod) {
      case 'POST':
        this.setAction(this.new);
        break;
      case 'GET':
        let values = this.request.parameters.header;
        if (values.length == 2) this.setAction(this.getEditForm);
        else this.setAction(this.show);
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
    const {
      userId,
      categoryId,
      title,
      type,
      content,
    } = this.request.parameters.body;

    let res;

    try {
      res = await Post.create(userId, categoryId, title, type, content);
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
      redirect: `category/${categoryId}`,
      message: 'Post created successfully!',
      payload: res,
    });
  }

  async show() {
    const res = await this.findPost(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    if (res.statusCode === statusCodes.NOT_FOUND) {
      await this.response.setResponse({
        template: 'ErrorView',
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: `Cannot retrieve Post: Post does not exist with ID ${this.request.parameters.header[0]}.`,
      });
      throw new PostException(
        `Cannot retrieve Post: Post does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    // hacky
    res.payload.canEdit = res.payload.type === 'Text';

    let comments = await Comment.findByPost(this.request.parameters.header[0]);

    if (comments != null) {
      comments = comments.map((item) => {
        return {
          id: item.getId(),
          username: item.getUser().getUsername(),
          createdAt: item.getCreatedAt(),
          content: item.getContent(),
          deletedAt: item.getDeletedAt(),
        };
      });
    } else comments = [];

    res.payload.comments = comments;

    return await this.response.setResponse({
      template: 'Post/ShowView',
      title: `${res.payload.getTitle()}`,
      payload: res.payload,
      message: 'Post retrieved successfully!',
      statusCode: 200,
    });
  }

  async edit() {
    const res = await this.findPost(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    if (res.statusCode === statusCodes.NOT_FOUND)
      throw new PostException(
        `Cannot update Post: Post does not exist with ID ${this.request.parameters.header[0]}.`
      );

    const { content } = this.request.parameters.body;
    if (!content) {
      await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: 400,
        payload: {},
        message: `Cannot update Post: No update parameters were provided.`,
      });

      throw new PostException(
        'Cannot update Post: No update parameters were provided.'
      );
    }

    res.payload.setContent(content);

    try {
      const ok = await res.payload.save();
    } catch (e) {
      throw e;
    }

    return await this.response.setResponse({
      redirect: `post/${res.payload.getId()}`,
      message: 'Post updated successfully!',
      payload: res.payload,
    });
  }

  async getEditForm() {
    const res = await Post.findById(
      parseInt(this.request.parameters.header[0])
    );

    return await this.response.setResponse({
      template: 'Post/EditView',
      statusCode: 200,
      payload: res,
    });
  }

  async destroy() {
    const res = await Post.findById(
      parseInt(this.request.parameters.header[0])
    );

    if (res === null)
      throw new PostException(
        `Cannot delete Post: Post does not exist with ID ${this.request.parameters.header[0]}.`
      );

    await res.remove();

    return await this.response.setResponse({
      redirect: `post/${res.getId()}`,
      message: 'Post deleted successfully!',
      payload: res,
    });
  }

  async findPost(id, params) {
    const res = await Post.findById(id);

    if (res === null) {
      return {
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: 'Could not retrieve Post.',
      };
    }
    return {
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Post retrieved successfully!',
    };
  }
}

module.exports = PostController;

const Controller = require('./Controller');
const Comment = require('../models/Comment');
const CommentException = require('../exceptions/CommentException');
const HttpStatusCode = require('../helpers/HttpStatusCode');

const statusCodes = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  ERROR: 400,
};

class CommentController extends Controller {
  constructor(request, response, session) {
    super(request, response, session);
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
    const { userId, postId, content } = this.request.parameters.body;
    console.log(userId, postId, content);

    const user_id = this.session.get('user_id');
    if (!user_id) {
      throw new CommentException(
        'Cannot create Comment: You must be logged in.',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    let res;

    try {
      res = await Comment.create(userId, postId, content);
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
      redirect: `post/${postId}`,
      message: 'Comment created successfully!',
      payload: res,
    });
  }

  async show() {
    const res = await this.findComment(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    if (res.statusCode === statusCodes.NOT_FOUND) {
      await this.response.setResponse({
        template: 'ErrorView',
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: `Cannot retrieve Comment: Comment does not exist with ID ${this.request.parameters.header[0]}.`,
      });
      throw new CommentException(
        `Cannot retrieve Comment: Comment does not exist with ID ${this.request.parameters.header[0]}.`
      );
    }

    let root = res.payload;
    let replies = [];

    // dfs and build child array
    let stack = [];
    let vis = Array(100).fill(0); // arbitrary limit on comments here
    stack.push(root.getId());
    while (stack.length) {
      let curr = stack.pop();

      if (!vis[curr]) {
        vis[curr] = 1;

        // get all comments with current reply id
        let comments = await Comment.getReplies(curr);

        if (comments == null) continue;

        for (let i = 0; i < comments.length; ++i) {
          let id = comments[i].getId();
          if (!vis[id]) {
            stack.push(id);
            replies.push(comments[i]);
          }
        }
      }
    }

    if (replies != null) {
      replies = replies.map((item) => {
        return {
          id: item.getId(),
          username: item.getUser().getUsername(),
          content: item.getContent(),
          createdAt: item.getCreatedAt(),
        };
      });
    } else replies = [];

    root.replies = replies;

    return await this.response.setResponse({
      template: 'Comment/ShowView',
      title: res.payload.getId(),
      payload: root,
      message: 'Comment retrieved successfully!',
      statusCode: 200,
    });
  }

  async edit() {
    const user_id = this.session.get('user_id');
    if (!user_id) {
      throw new CommentException(
        'Cannot update Comment: You must be logged in.',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    const res = await this.findComment(
      parseInt(this.request.parameters.header[0]),
      this.request.parameters
    );

    if (res.statusCode === statusCodes.NOT_FOUND)
      throw new CommentException(
        `Cannot update Comment: Comment does not exist with ID ${this.request.parameters.header[0]}.`
      );

    if (res.payload.deletedAt)
      throw new CommentException(
        `Cannot update Comment: You cannot update a comment that has been deleted.`
      );

    if (res.payload.user.getId() !== user_id) {
      throw new CommentException(
        'Cannot update Comment: You cannot update a comment created by someone other than yourself.',
        HttpStatusCode.FORBIDDEN
      );
    }

    const { content } = this.request.parameters.body;
    if (!content) {
      await this.response.setResponse({
        template: 'ErrorView',
        title: 'Error',
        statusCode: 400,
        payload: {},
        message: `Cannot update Comment: No update parameters were provided.`,
      });

      throw new CommentException(
        `Cannot update Comment: No update parameters were provided.`
      );
    }

    res.payload.setContent(content);

    try {
      const ok = await res.payload.save();
    } catch (e) {
      throw e;
    }

    return await this.response.setResponse({
      redirect: `post/${res.payload.getPost().getId()}`,
      message: 'Comment updated successfully!',
      payload: res.payload,
    });
  }

  async getEditForm() {
    const id = parseInt(this.request.parameters.header[0]);

    const user_id = this.session.get('user_id');
    if (!user_id) {
      throw new CommentException(
        'Cannot update Comment: You must be logged in.',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    const res = await Comment.findById(id);
    if (!res) {
      throw new CommentException(
        `Cannot update Comment: Comment does not exist with ID ${id}.`
      );
    }

    if (res.user.getId() !== user_id) {
      throw new CommentException(
        'Cannot update Comment: You cannot update a comment created by someone other than yourself.',
        HttpStatusCode.FORBIDDEN
      );
    }

    return await this.response.setResponse({
      template: 'Comment/EditFormView',
      statusCode: 200,
      payload: res,
    });
  }

  async destroy() {
    const user_id = this.session.get('user_id');
    if (!user_id) {
      throw new CommentException(
        'Cannot delete Comment: You must be logged in.',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    const res = await Comment.findById(
      parseInt(this.request.parameters.header[0])
    );

    if (res === null)
      throw new CommentException(
        `Cannot delete Comment: Comment does not exist with ID ${this.request.parameters.header[0]}.`
      );

    if (res.deletedAt)
      throw new CommentException(
        `Cannot delete Comment: You cannot delete a comment that has been deleted.`
      );

    if (res.user.getId() !== user_id) {
      throw new CommentException(
        'Cannot delete Comment: You cannot delete a comment created by someone other than yourself.',
        HttpStatusCode.FORBIDDEN
      );
    }

    await res.remove();

    return await this.response.setResponse({
      redirect: `post/${res.getPost().getId()}`,
      message: 'Comment deleted successfully!',
      payload: res,
    });
  }

  async findComment(id, params) {
    const res = await Comment.findById(parseInt(id));

    if (res === null) {
      return {
        statusCode: statusCodes.NOT_FOUND,
        payload: {},
        message: 'Could not retrieve Comment.',
      };
    }
    return {
      statusCode: statusCodes.SUCCESS,
      payload: res,
      message: 'Comment retrieved successfully!',
    };
  }
}

module.exports = CommentController;

const Controller = require('./Controller');
const Post = require('../models/Post');

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
                this.setAction(this.show);
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
        const res = await Post.create(
            this.request.parameters.body.userId,
            this.request.parameters.body.categoryId,
            this.request.parameters.body.title,
            this.request.parameters.body.type,
            this.request.parameters.body.content
        );
        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Post not created.',
            });
        } else {
            this.response.setResponse({
                statusCode: statusCodes.SUCCESS,
                payload: res,
                message: 'Post created successfully!',
            });
        }
        return this.response;
    }

    async show() {
        const res = await this.findPost(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );
        if (res.statusCode === statusCodes.NOT_FOUND) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Post not retrieved.',
            });
            return this.response;
        }
        this.response.setResponse(res);
        return this.response;
    }

    async edit() {
        const res = await this.findPost(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );

        if (res.statusCode === statusCodes.NOT_FOUND) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Post not updated.',
            });
            return this.response;
        }

        const { content } = this.request.parameters.body;
        res.payload.setContent(content);

        const ok = await res.payload.save();
        if (!ok) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: res.payload,
                message: 'Post not updated.',
            });
            return this.response;
        }

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res.payload,
            message: 'Post updated successfully!',
        });
        return this.response;
    }

    async destroy() {
        const res = await Post.findById(
            parseInt(this.request.parameters.header[0])
        );

        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Post not deleted.',
            });
            return this.response;
        }

        await res.remove();

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'Post deleted successfully!',
        });
        return this.response;
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

const Controller = require('./Controller');
const Comment = require('../models/Comment');

const statusCodes = {
    SUCCESS: 200,
    NOT_FOUND: 404,
    ERROR: 400,
};

class CommentController extends Controller {
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
        const res = await Comment.create(
            this.request.parameters.body.userId,
            this.request.parameters.body.postId,
            this.request.parameters.body.content
        );

        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Comment not created.',
            });
            return this.response;
        }

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'Comment created successfully!',
        });
        return this.response;
    }

    async show() {
        const res = await this.findComment(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );
        if (res.statusCode === statusCodes.NOT_FOUND) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: res,
                message: 'Comment not retrieved.',
            });
            return this.response;
        }
        this.response.setResponse(res);
        return this.response;
    }

    async edit() {
        const res = await this.findComment(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );

        if (res.statusCode === statusCodes.NOT_FOUND) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Comment not updated.',
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
                message: 'Comment not updated.',
            });
            return this.response;
        }

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res.payload,
            message: 'Comment updated successfully!',
        });
        return this.response;
    }

    async destroy() {
        const res = await Comment.findById(
            parseInt(this.request.parameters.header[0])
        );
        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Comment not deleted.',
            });
            return this.response;
        }

        await res.remove();

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'Comment deleted successfully!',
        });
        return this.response;
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

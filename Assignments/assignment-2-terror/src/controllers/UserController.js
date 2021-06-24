const Controller = require('./Controller');
const User = require('../models/User');

const statusCodes = {
    SUCCESS: 200,
    NOT_FOUND: 404,
    ERROR: 400,
};

class UserController extends Controller {
    constructor(request, response) {
        super(request, response);
        switch (request.requestMethod) {
            case 'POST':
                this.setAction(this.new);
                break;
            case 'GET':
                if (this.request.parameters.header.length)
                    this.setAction(this.show);
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
        const { username, email, password } = this.request.parameters.body;
        const res = await User.create(username, email, password);
        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'User not created.',
            });
        } else {
            this.response.setResponse({
                statusCode: statusCodes.SUCCESS,
                payload: res,
                message: 'User created successfully!',
            });
        }
        return this.response;
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
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'User not retrieved.',
            });
            return this.response;
        }

        this.response.setResponse(res);
        return this.response;
    }

    async edit() {
        const res = await this.findUser(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );

        if (res.statusCode === statusCodes.NOT_FOUND) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'User not updated.',
            });
            return this.response;
        }

        const { username, email } = this.request.parameters.body;
        res.payload.setUsername(username);
        res.payload.setEmail(email);

        const ok = await res.payload.save();
        // couldn't do it
        if (!ok) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'User not updated.',
            });
            return this.response;
        }

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res.payload,
            message: 'User updated successfully!',
        });
        return this.response;
    }

    async destroy() {
        const res = await User.findById(
            parseInt(this.request.parameters.header[0])
        );

        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'User not deleted.',
            });
            return this.response;
        }

        await res.remove();

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'User deleted successfully!',
        });
        return this.response;
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

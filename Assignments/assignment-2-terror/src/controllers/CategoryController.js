const Controller = require('./Controller');
const Category = require('../models/Category');

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
        const res = await Category.create(
            this.request.parameters.body.userId,
            this.request.parameters.body.title,
            this.request.parameters.body.description
        );
        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Category not created.',
            });
            return this.response;
        }
        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'Category created successfully!',
        });
        return this.response;
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
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Category not retrieved.',
            });
            return this.response;
        }

        this.response.setResponse(res);
        return this.response;
    }

    async edit() {
        const res = await this.findCategory(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );

        if (res.statusCode === statusCodes.NOT_FOUND) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Category not updated.',
            });
            return this.response;
        }

        const { title, description } = this.request.parameters.body;
        res.payload.setTitle(title);
        res.payload.setDescription(description);

        const ok = await res.payload.save();
        if (!ok) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Category not updated.',
            });
            return this.response;
        }

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res.payload,
            message: 'Category updated successfully!',
        });
        return this.response;
    }

    async destroy() {
        const res = await Category.findById(
            parseInt(this.request.parameters.header[0])
        );

        if (res === null) {
            this.response.setResponse({
                statusCode: statusCodes.ERROR,
                payload: {},
                message: 'Category not deleted.',
            });
            return this.response;
        }

        const ok = await res.remove();
        if (!ok) {
            this.response.setResponse({
                statusCode: statusCodes.SUCCESS,
                payload: res,
                message: 'Category not deleted.',
            });
            return this.response;
        }

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'Category deleted successfully!',
        });
        return this.response;
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

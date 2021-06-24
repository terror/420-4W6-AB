const Controller = require('./Controller');
const Pokemon = require('../models/Pokemon');

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
        const res = await Pokemon.create(
            this.request.parameters.body.name,
            this.request.parameters.body.type
        );

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
        const res = await this.findPokemon(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );
        this.response.setResponse(res);
        return this.response;
    }

    async edit() {
        const res = await this.findPokemon(
            parseInt(this.request.parameters.header[0]),
            this.request.parameters
        );

        if (res.statusCode === statusCodes.NOT_FOUND) {
            this.response.setResponse(res);
            return this.response;
        }

        if (this.request.parameters.body.name)
            res.payload.setName(this.request.parameters.body.name);
        if (this.request.parameters.body.type)
            res.payload.setType(this.request.parameters.body.type);

        await res.payload.save();

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res.payload,
            message: 'Pokemon updated successfully!',
        });
        return this.response;
    }

    async destroy() {
        const res = await Pokemon.findById(
            parseInt(this.request.parameters.header[0])
        );
        await res.delete();

        this.response.setResponse({
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'Pokemon deleted successfully!',
        });
        return this.response;
    }

    async findPokemon(id, params) {
        const res = await Pokemon.findById(
            parseInt(this.request.parameters.header[0])
        );
        if (res === null) {
            return {
                statusCode: statusCodes.NOT_FOUND,
                payload: {},
                message: 'Could not retrieve Pokemon.',
            };
        }
        return {
            statusCode: statusCodes.SUCCESS,
            payload: res,
            message: 'Pokemon retrieved successfully!',
        };
    }
}

module.exports = PokemonController;

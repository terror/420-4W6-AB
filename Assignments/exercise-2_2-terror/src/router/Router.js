const Pokemon = require('../models/Pokemon');

const statusCodes = {
    SUCCESS: 200,
    NOT_FOUND: 404,
};

/**
 * This class is responsible for invoking the appropriate method
 * on the appropriate model based on the results of the parsed `Request`.
 * Once the `message` and `payload` have been determined, it will return
 * a `Response` object to be sent back to the client as an HTTP response.
 */
class Router {
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }

    async dispatch() {
        const method = this.request.requestMethod;
        const modelName = this.request.modelName;
        const params = this.request.parameters;

        // validate URL
        if (this.request.modelName && this.request.modelName !== 'pokemon') {
            this.response.setResponse({
                message: 'Invalid URL!',
                payload: {},
                statusCode: statusCodes.NOT_FOUND,
            });
            return this.response;
        }

        // check for homepage
        if (this.request.modelName === '') {
            this.response.setResponse({
                message: 'Homepage!',
                payload: {},
                statusCode: statusCodes.SUCCESS,
            });
            return this.response;
        }

        // now we dispatch pokemon routes
        let res;
        switch (method) {
            case 'GET':
                // we find by ID
                if (params.header.length) {
                    res = await this.findPokemon(
                        parseInt(params.header[0]),
                        params
                    );
                    this.response.setResponse(res);
                    return this.response;
                }

                // we find all
                res = await Pokemon.findAll();
                this.response.setResponse({
                    statusCode: statusCodes.SUCCESS,
                    payload: res,
                    message: 'Pokemon retrieved successfully!',
                });

                break;
            case 'POST':
                res = await Pokemon.create(params.body.name, params.body.type);

                this.response.setResponse({
                    statusCode: statusCodes.SUCCESS,
                    payload: res,
                    message: 'Pokemon created successfully!',
                });
                break;
            case 'PUT':
                res = await this.findPokemon(
                    parseInt(params.header[0]),
                    params
                );

                if (res.statusCode === statusCodes.NOT_FOUND) {
                    this.response.setResponse(res);
                    return this.response;
                }

                if (params.body.name) res.payload.setName(params.body.name);
                if (params.body.type) res.payload.setType(params.body.type);

                await res.payload.save();

                this.response.setResponse({
                    statusCode: statusCodes.SUCCESS,
                    payload: res.payload,
                    message: 'Pokemon updated successfully!',
                });
                break;
            case 'DELETE':
                res = await Pokemon.findById(parseInt(params.header[0]));
                await res.delete();

                this.response.setResponse({
                    statusCode: statusCodes.SUCCESS,
                    payload: res,
                    message: 'Pokemon deleted successfully!',
                });
                break;
            default:
                break;
        }
        return this.response;
    }

    async findPokemon(id, params) {
        const res = await Pokemon.findById(parseInt(params.header[0]));
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

module.exports = Router;

const Controller = require('./Controller');

class ErrorController extends Controller {
    constructor(request, response) {
        super(request, response);
        this.setAction(this.error);
        this.response.setResponse({
            statusCode: 404,
            message: 'Invalid request path!',
            payload: {},
        });
    }
}

module.exports = ErrorController;

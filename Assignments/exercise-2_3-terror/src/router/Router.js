const Pokemon = require('../models/Pokemon');
const ErrorController = require('../controllers/ErrorController');
const HomeController = require('../controllers/HomeController');
const PokemonController = require('../controllers/PokemonController');

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
        this.setController(this.request.controllerName);
    }

    setController(c) {
        if (c === '')
            this.controller = new HomeController(this.request, this.response);
        else if (c === 'pokemon')
            this.controller = new PokemonController(
                this.request,
                this.response
            );
        else this.controller = new ErrorController(this.request, this.response);
    }

    getController() {
        return this.controller;
    }

    async dispatch() {
        return this.controller.doAction();
    }
}

module.exports = Router;

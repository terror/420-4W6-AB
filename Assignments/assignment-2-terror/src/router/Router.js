const UserController = require('../controllers/UserController');
const CategoryController = require('../controllers/CategoryController');
const PostController = require('../controllers/PostController');
const CommentController = require('../controllers/CommentController');
const HomeController = require('../controllers/HomeController');
const ErrorController = require('../controllers/ErrorController');

class Router {
    constructor(request, response) {
        this.request = request;
        this.response = response;
        this.setController(this.request.controllerName);
    }

    setController(c) {
        switch (c) {
            case '':
                this.controller = new HomeController(
                    this.request,
                    this.response
                );
                break;
            case 'user':
                this.controller = new UserController(
                    this.request,
                    this.response
                );
                break;
            case 'category':
                this.controller = new CategoryController(
                    this.request,
                    this.response
                );
                break;
            case 'post':
                this.controller = new PostController(
                    this.request,
                    this.response
                );
                break;
            case 'comment':
                this.controller = new CommentController(
                    this.request,
                    this.response
                );
                break;
            default:
                this.controller = new ErrorController(
                    this.request,
                    this.response
                );
                break;
        }
    }

    getController() {
        return this.controller;
    }

    async dispatch() {
        return this.controller.doAction();
    }
}

module.exports = Router;

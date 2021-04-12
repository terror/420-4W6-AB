const Controller = require('./Controller');

class ErrorController extends Controller {
  constructor(request, response) {
    super(request, response);
    this.setAction(this.error);
  }
}

module.exports = ErrorController;
